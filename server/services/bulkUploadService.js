const { parse } = require("csv-parse/sync");
const mongoose = require('mongoose');
const BulkUploadBatch = require('../models/BulkUploadBatch');
const Category = require('../models/Category');
const Product = require('../models/Product');
const CustomerOrder = require('../models/CustomerOrder');

// Validate a single CSV row according to the Product schema constraints
function validateRow(row) {
  const errs = [];
  const clean = {};

  const title = String(row.title ?? "").trim();
  const slug = String(row.slug ?? "").trim();
  const price = Number(row.price);
  const categoryId = String(row.categoryId ?? "").trim();
  const inStock = Number(row.inStock ?? 0);

  if (!title) errs.push("title is required");
  if (!slug) errs.push("slug is required");
  if (!Number.isFinite(price) || price < 0)
    errs.push("price must be a non-negative number");
  if (!categoryId) errs.push("categoryId is required");
  if (!Number.isFinite(inStock) || inStock < 0)
    errs.push("inStock must be a non-negative number");

  if (errs.length) return { ok: false, error: errs.join(", ") };

  clean.title = title;
  clean.slug = slug;
  clean.price = Math.round(price * 100) / 100; // Keep 2 decimal places
  clean.categoryId = categoryId;
  clean.inStock = Math.floor(inStock); // Integer stock quantity

  clean.manufacturer = row.manufacturer
    ? String(row.manufacturer).trim()
    : null;
  clean.description = row.description ? String(row.description).trim() : null;
  clean.mainImage = row.mainImage ? String(row.mainImage).trim() : null;

  return { ok: true, data: clean };
}

async function parseCsvBufferToRows(buffer) {
  const text = buffer.toString("utf-8");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}

function computeBatchStatus(successCount, errorCount) {
  if (successCount > 0 && errorCount === 0) return "COMPLETED";
  if (successCount > 0 && errorCount > 0) return "PARTIAL";
  if (successCount === 0 && errorCount > 0) return "FAILED";
  return "PENDING";
}

// Create products + items for valid rows, error items for invalid
async function createBatchWithItems(session, batchId, validRows, errorRows) {
  const uniqueCategoryIds = [...new Set(validRows.map((r) => r.categoryId))];

  // Fetch categories by both ID and name (case-insensitive)
  const categories = await Category.find({
    $or: [
      { _id: { $in: uniqueCategoryIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
      { name: { $in: uniqueCategoryIds } },
    ],
  }, { _id: 1, name: 1 }).session(session);

  // Create a map for both ID and name lookup
  const categoryMap = new Map();
  categories.forEach((cat) => {
    categoryMap.set(cat._id.toString(), cat._id.toString()); // ObjectId -> ObjectId string
    categoryMap.set(cat.name.toLowerCase(), cat._id.toString()); // name -> ObjectId string
  });

  let success = 0;
  let failed = 0;

  for (const row of validRows) {
    // Try to resolve categoryId (could be ObjectId string or category name)
    const resolvedCategoryId =
      categoryMap.get(row.categoryId) ||
      categoryMap.get(row.categoryId.toLowerCase());

    if (!resolvedCategoryId) {
      await BulkUploadBatch.findByIdAndUpdate(
        batchId,
        {
          $push: {
            items: {
              title: row.title,
              slug: row.slug,
              price: row.price,
              manufacturer: row.manufacturer,
              description: row.description,
              mainImage: row.mainImage,
              categoryId: row.categoryId,
              inStock: row.inStock,
              status: "ERROR",
              error: `Category not found: ${row.categoryId}`,
            }
          }
        },
        { session }
      );
      failed++;
      continue;
    }

    try {
      const product = new Product({
        title: row.title,
        slug: row.slug,
        price: row.price,
        rating: 5,
        description: row.description ?? "",
        manufacturer: row.manufacturer ?? "",
        mainImage: row.mainImage ?? "",
        categoryId: resolvedCategoryId,
        inStock: row.inStock,
      });
      await product.save({ session });

      await BulkUploadBatch.findByIdAndUpdate(
        batchId,
        {
          $push: {
            items: {
              productId: product._id,
              title: row.title,
              slug: row.slug,
              price: row.price,
              manufacturer: row.manufacturer,
              description: row.description,
              mainImage: row.mainImage,
              categoryId: resolvedCategoryId,
              inStock: row.inStock,
              status: "CREATED",
              error: null,
            }
          }
        },
        { session }
      );
      success++;
    } catch (e) {
      await BulkUploadBatch.findByIdAndUpdate(
        batchId,
        {
          $push: {
            items: {
              title: row.title,
              slug: row.slug,
              price: row.price,
              manufacturer: row.manufacturer,
              description: row.description,
              mainImage: row.mainImage,
              categoryId: resolvedCategoryId || row.categoryId,
              inStock: row.inStock,
              status: "ERROR",
              error: e?.message || "Create failed",
            }
          }
        },
        { session }
      );
      failed++;
    }
  }

  for (const err of errorRows) {
    await BulkUploadBatch.findByIdAndUpdate(
      batchId,
      {
        $push: {
          items: {
            title: "",
            slug: "",
            price: 0,
            manufacturer: null,
            description: null,
            mainImage: null,
            categoryId: "",
            inStock: 0,
            status: "ERROR",
            error: `Row ${err.index}: ${err.error}`,
          }
        }
      },
      { session }
    );
    failed++;
  }

  return { successCount: success, errorCount: failed };
}

async function getBatchSummary(batchId) {
  const batch = await BulkUploadBatch.findById(batchId).select('items');
  if (!batch) return { total: 0, errors: 0, created: 0, updated: 0 };

  const total = batch.items.length;
  const errors = batch.items.filter(item => item.status === 'ERROR').length;
  const created = batch.items.filter(item => item.status === 'CREATED').length;
  const updated = batch.items.filter(item => item.status === 'UPDATED').length;

  return { total, errors, created, updated };
}

async function canDeleteProductsForBatch(batchId) {
  const batch = await BulkUploadBatch.findById(batchId).select('items.productId');
  if (!batch) return { canDelete: true, blockedProductIds: [] };

  const productIds = batch.items
    .map(item => item.productId)
    .filter(id => id != null);

  if (productIds.length === 0) {
    return { canDelete: true, blockedProductIds: [] };
  }

  // Check if any products are referenced in orders
  const ordersWithProducts = await CustomerOrder.find({
    'products.productId': { $in: productIds }
  }).select('products.productId');

  const referencedProductIds = new Set();
  ordersWithProducts.forEach(order => {
    order.products.forEach(product => {
      if (productIds.includes(product.productId.toString())) {
        referencedProductIds.add(product.productId.toString());
      }
    });
  });

  const blockedList = productIds.filter(id => referencedProductIds.has(id.toString()));

  if (blockedList.length > 0) {
    return {
      canDelete: false,
      reason: "Some products are in orders",
      blockedProductIds: blockedList,
    };
  }

  return { canDelete: true, blockedProductIds: [] };
}

async function applyItemUpdates(session, batchId, updates) {
  // updates: [{ itemId, price, inStock }]
  const batch = await BulkUploadBatch.findById(batchId).select('items').session(session);
  if (!batch) return [];

  const result = [];

  for (const upd of updates) {
    const itemIndex = batch.items.findIndex(item => item._id.toString() === upd.itemId);
    if (itemIndex === -1) continue;

    const item = batch.items[itemIndex];
    const price = Math.round(Number(upd.price));
    const inStock = Number(upd.inStock) === 1 ? 1 : 0;

    // Update product if it exists
    if (item.productId) {
      await Product.findByIdAndUpdate(
        item.productId,
        { price, inStock },
        { session }
      );
    }

    // Update the item in the batch
    await BulkUploadBatch.updateOne(
      { _id: batchId, 'items._id': upd.itemId },
      {
        $set: {
          'items.$.price': price,
          'items.$.inStock': inStock,
          'items.$.status': 'UPDATED',
          'items.$.error': null
        }
      },
      { session }
    );

    // Get the updated item for return
    const updatedBatch = await BulkUploadBatch.findOne(
      { _id: batchId, 'items._id': upd.itemId },
      { 'items.$': 1 }
    ).session(session);

    if (updatedBatch && updatedBatch.items.length > 0) {
      result.push(updatedBatch.items[0]);
    }
  }

  return result;
}

module.exports = {
  parseCsvBufferToRows,
  validateRow,
  createBatchWithItems,
  computeBatchStatus,
  getBatchSummary,
  canDeleteProductsForBatch,
  applyItemUpdates,
};
