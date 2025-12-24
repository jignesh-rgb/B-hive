const mongoose = require('mongoose');
const BulkUploadBatch = require('../models/BulkUploadBatch');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require("../utills/errorHandler");
const {
  parseCsvBufferToRows,
  validateRow,
  createBatchWithItems,
  computeBatchStatus,
  getBatchSummary,
  canDeleteProductsForBatch,
  applyItemUpdates,
} = require("../services/bulkUploadService");

// POST /api/bulk-upload
const uploadCsvAndCreateBatch = asyncHandler(async (req, res) => {
  console.log("📦 Bulk upload request received");
  console.log("Files:", req.files);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);

  const csvFile = req.files?.file;
  if (!csvFile) {
    console.log("❌ No file uploaded");
    throw new AppError("CSV file is required (field name: 'file')", 400);
  }

  console.log("✅ File received:", csvFile.name, csvFile.size, "bytes");

  const rows = await parseCsvBufferToRows(csvFile.data);
  console.log("📊 Parsed rows:", rows.length);

  if (!rows || rows.length === 0) {
    throw new AppError("CSV has no rows", 400);
  }

  const valid = [];
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const { ok, data, error } = validateRow(rows[i]);
    if (ok) valid.push(data);
    else errors.push({ index: i + 1, error });
  }

  console.log("✅ Valid rows:", valid.length);
  console.log("❌ Invalid rows:", errors.length);

  // Create batch and process items in a transaction
  const session = await mongoose.startSession();
  let createdBatch;

  try {
    await session.withTransaction(async () => {
      // Create batch
      createdBatch = await BulkUploadBatch.create([{
        fileName: csvFile.name,
        status: "PENDING",
        itemCount: rows.length,
        errorCount: errors.length,
      }], { session });

      createdBatch = createdBatch[0]; // create returns an array

      const { successCount, errorCount } = await createBatchWithItems(
        session,
        createdBatch._id,
        valid,
        errors
      );

      const finalStatus = computeBatchStatus(successCount, errorCount);
      await BulkUploadBatch.findByIdAndUpdate(createdBatch._id, {
        status: finalStatus,
        itemCount: successCount + errorCount,
        errorCount,
      }, { session });
    });

    const summary = await getBatchSummary(createdBatch._id);

    return res.status(201).json({
      batchId: createdBatch._id,
      status: createdBatch.status,
      ...summary,
      validationErrors: errors,
    });
  } finally {
    await session.endSession();
  }
});

// GET /api/bulk-upload
const listBatches = asyncHandler(async (req, res) => {
  const batches = await BulkUploadBatch.find({})
    .sort({ createdAt: -1 })
    .populate('items');

  // Get details for each batch
  const batchesWithDetails = batches.map((batch) => {
    const items = batch.items || [];
    const successfulRecords = items.filter(
      (item) => item.status === "CREATED" && item.productId !== null
    ).length;
    const failedRecords = items.filter(
      (item) => item.status === "ERROR" || item.error !== null
    ).length;

    // Collect error messages
    const errors = items
      .filter((item) => item.error)
      .map((item) => item.error);

    return {
      id: batch._id,
      fileName: batch.fileName || `batch-${batch._id.toString().substring(0, 8)}.csv`,
      totalRecords: items.length,
      successfulRecords,
      failedRecords,
      status: batch.status,
      uploadedBy: "Admin", // You can get this from session if needed
      uploadedAt: batch.createdAt,
      errors: errors.length > 0 ? errors : undefined,
    };
  });

  return res.json({ batches: batchesWithDetails });
});

// GET /api/bulk-upload/:batchId
const getBatchDetail = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  if (!batchId) throw new AppError("Batch ID is required", 400);

  const batch = await BulkUploadBatch.findById(batchId);
  if (!batch) throw new AppError("Batch not found", 404);

  // Populate product references in items
  const populatedBatch = await BulkUploadBatch.findById(batchId).populate('items.productId');

  return res.json({ batch: populatedBatch, items: populatedBatch.items });
});

// PUT /api/bulk-upload/:batchId
const updateBatchItems = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { items } = req.body;

  if (!batchId) throw new AppError("Batch ID is required", 400);
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Items array is required", 400);
  }

  const session = await mongoose.startSession();
  let updated;

  try {
    await session.withTransaction(async () => {
      updated = await applyItemUpdates(session, batchId, items);
    });

    return res.json({ updatedCount: updated.length, items: updated });
  } finally {
    await session.endSession();
  }
});

// DELETE /api/bulk-upload/:batchId?deleteProducts=true/false
const deleteBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const deleteProducts = req.query.deleteProducts === "true";

  if (!batchId) throw new AppError("Batch ID is required", 400);

  console.log(
    `🗑️ Deleting batch ${batchId}, deleteProducts: ${deleteProducts}`
  );

  // Check if batch exists
  const batch = await BulkUploadBatch.findById(batchId);
  if (!batch) {
    throw new AppError("Batch not found", 404);
  }

  const session = await mongoose.startSession();

  try {
    if (deleteProducts) {
      // Check if products can be deleted (not in orders)
      console.log("🔍 Checking if products can be deleted...");
      const check = await canDeleteProductsForBatch(batchId);
      console.log("Check result:", check);

      if (!check.canDelete) {
        const errorMsg =
          check.blockedProductIds && check.blockedProductIds.length > 0
            ? `Cannot delete products: ${
                check.reason
              }. Products in orders: ${check.blockedProductIds.join(", ")}`
            : `Cannot delete products: ${check.reason || "Unknown error"}`;

        throw new AppError(errorMsg, 409);
      }

      // Delete batch + items + products in transaction
      await session.withTransaction(async () => {
        const productIds = batch.items
          .map(item => item.productId)
          .filter(id => id != null);

        console.log(`🗑️ Deleting ${productIds.length} products`);

        if (productIds.length > 0) {
          // Delete products
          const deletedProducts = await Product.deleteMany(
            { _id: { $in: productIds } },
            { session }
          );
          console.log(`✅ Deleted ${deletedProducts.deletedCount} products`);
        }

        // Delete batch (this will also delete embedded items)
        await BulkUploadBatch.findByIdAndDelete(batchId, { session });
        console.log(`✅ Deleted batch`);
      });

      console.log(`✅ Batch and products deleted successfully`);
      return res.status(200).json({
        success: true,
        message: "Batch and products deleted successfully",
        deletedProducts: true,
      });
    } else {
      // Delete batch + items only, keep products
      await session.withTransaction(async () => {
        // Delete batch (this will also delete embedded items)
        await BulkUploadBatch.findByIdAndDelete(batchId, { session });
        console.log(`✅ Deleted batch`);
      });

      console.log(`✅ Batch deleted (products kept)`);
      return res.status(200).json({
        success: true,
        message: "Batch deleted successfully (products kept)",
        deletedProducts: false,
      });
    }
  } finally {
    await session.endSession();
  }
});

module.exports = {
  uploadCsvAndCreateBatch,
  listBatches,
  getBatchDetail,
  updateBatchItems,
  deleteBatch,
};
