const { asyncHandler, handleServerError, AppError } = require("../utills/errorHandler");
const Product = require('../models/Product');
const Category = require('../models/Category');

// Security: Define whitelists for allowed filter types and operators
const ALLOWED_FILTER_TYPES = ['price', 'rating', 'category', 'inStock', 'outOfStock'];
const ALLOWED_OPERATORS = ['gte', 'lte', 'gt', 'lt', 'equals', 'contains'];
const ALLOWED_SORT_VALUES = ['defaultSort', 'titleAsc', 'titleDesc', 'lowPrice', 'highPrice'];

// Security: Input validation functions
function validateFilterType(filterType) {
  return ALLOWED_FILTER_TYPES.includes(filterType);
}

function validateOperator(operator) {
  return ALLOWED_OPERATORS.includes(operator);
}

function validateSortValue(sortValue) {
  return ALLOWED_SORT_VALUES.includes(sortValue);
}

function validateAndSanitizeFilterValue(filterType, filterValue) {
  switch (filterType) {
    case 'price':
    case 'rating':
    case 'inStock':
    case 'outOfStock':
      const numValue = parseInt(filterValue);
      return isNaN(numValue) ? null : numValue;
    case 'category':
      return typeof filterValue === 'string' && filterValue.trim().length > 0 
        ? filterValue.trim() 
        : null;
    default:
      return null;
  }
}

// Security: Safe filter object builder
function buildSafeFilterObject(filterArray) {
  const filterObj = {};
  
  for (const item of filterArray) {
    // Validate filter type
    if (!validateFilterType(item.filterType)) {
      console.warn(`Invalid filter type: ${item.filterType}`);
      continue;
    }
    
    // Validate operator
    if (!validateOperator(item.filterOperator)) {
      console.warn(`Invalid operator: ${item.filterOperator}`);
      continue;
    }
    
    // Validate and sanitize filter value
    const sanitizedValue = validateAndSanitizeFilterValue(item.filterType, item.filterValue);
    if (sanitizedValue === null) {
      console.warn(`Invalid filter value for ${item.filterType}: ${item.filterValue}`);
      continue;
    }
    
    // Build safe filter object
    filterObj[item.filterType] = {
      [item.filterOperator]: sanitizedValue,
    };
  }
  
  return filterObj;
}

const getAllProducts = asyncHandler(async (request, response) => {
  const mode = request.query.mode || "";
  
  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there
  if(mode === "admin"){
    const adminProducts = await Product.find({}).populate('categoryId', 'name').populate('merchantId', 'name');
    return response.json(adminProducts);
  } else {
    const dividerLocation = request.url.indexOf("?");
    let filterObj = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // getting current page with validation
    const page = Number(request.query.page);
    const validatedPage = (page && page > 0) ? page : 1;

    if (dividerLocation !== -1) {
      const queryArray = request.url
        .substring(dividerLocation + 1, request.url.length)
        .split("&");

      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        // Security: Use more robust parsing with validation
        const queryParam = queryArray[i];
        
        // Extract filter type safely
        if (queryParam.includes("filters")) {
          if (queryParam.includes("price")) {
            filterType = "price";
          } else if (queryParam.includes("rating")) {
            filterType = "rating";
          } else if (queryParam.includes("category")) {
            filterType = "category";
          } else if (queryParam.includes("inStock")) {
            filterType = "inStock";
          } else if (queryParam.includes("outOfStock")) {
            filterType = "outOfStock";
          } else {
            // Skip unknown filter types
            continue;
          }
        }

        if (queryParam.includes("sort")) {
          // Security: Validate sort value
          const extractedSortValue = queryParam.substring(queryParam.indexOf("=") + 1);
          if (validateSortValue(extractedSortValue)) {
            sortByValue = extractedSortValue;
          }
        }

        // Security: Extract filter parameters safely
        if (queryParam.includes("filters") && filterType) {
          let filterValue;
          
          // Extract filter value based on type
          if (filterType === "category") {
            filterValue = queryParam.substring(queryParam.indexOf("=") + 1);
          } else {
            const numValue = parseInt(queryParam.substring(queryParam.indexOf("=") + 1));
            filterValue = isNaN(numValue) ? null : numValue;
          }

          // Extract operator safely
          const operatorStart = queryParam.indexOf("$") + 1;
          const operatorEnd = queryParam.indexOf("=") - 1;
          
          if (operatorStart > 0 && operatorEnd > operatorStart) {
            const filterOperator = queryParam.substring(operatorStart, operatorEnd);
            
            // Only add to filter array if all values are valid
            if (filterValue !== null && filterOperator) {
              filterArray.push({ 
                filterType, 
                filterOperator, 
                filterValue 
              });
            }
          }
        }
      }
      
      // Security: Build filter object using safe function
      filterObj = buildSafeFilterObject(filterArray);
    }

    let whereClause = { ...filterObj };

    // Security: Handle category filter separately with validation
    if (filterObj.category && filterObj.category.equals) {
      delete whereClause.category;
    }

    // Security: Build sort object safely
    switch (sortByValue) {
      case "defaultSort":
        sortObj = {};
        break;
      case "titleAsc":
        sortObj = { title: "asc" };
        break;
      case "titleDesc":
        sortObj = { title: "desc" };
        break;
      case "lowPrice":
        sortObj = { price: "asc" };
        break;
      case "highPrice":
        sortObj = { price: "desc" };
        break;
      default:
        sortObj = {};
    }

    let products;
    let query = {};

    // Build MongoDB query
    if (Object.keys(filterObj).length > 0) {
      query = { ...whereClause };

      // Handle category filter specially
      if (filterObj.category && filterObj.category.equals) {
        delete query.category;
        // Find category by name and use its ID
        const category = await Category.findOne({ name: filterObj.category.equals });
        if (category) {
          query.categoryId = category._id;
        } else {
          // If category doesn't exist, return empty results
          return response.json([]);
        }
      }
    }

    // Execute query with pagination and sorting
    products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort(sortObj)
      .skip((validatedPage - 1) * 10)
      .limit(12);

    return response.json(products);
  }
});

const getAllProductsOld = asyncHandler(async (request, response) => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  response.status(200).json(products);
});

const createProduct = asyncHandler(async (request, response) => {
  console.log("Create product request received");
  console.log("Request body:", request.body);
  console.log("Request headers:", request.headers);

  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    description,
    manufacturer,
    categoryId,
    inStock,
  } = request.body;

  // Validate required fields
  if (!title) {
    throw new AppError("Missing required field: title", 400);
  }
  
  if (!merchantId) {
    throw new AppError("Missing required field: merchantId", 400);
  }

  // Validate merchantId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(merchantId)) {
    throw new AppError(`Invalid merchantId format: ${merchantId}. Expected a valid ObjectId string.`, 400);
  }

  if (!slug) {
    throw new AppError("Missing required field: slug", 400);
  }

  if (!price) {
    throw new AppError("Missing required field: price", 400);
  }

  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  // Validate categoryId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError(`Invalid categoryId format: ${categoryId}. Expected a valid ObjectId string.`, 400);
  }

  console.log("Creating product with data:", {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    description,
    manufacturer,
    categoryId,
    inStock,
  });

  const product = await Product.create({
    merchantId,
    slug,
    title,
    mainImage,
    price,
    rating: 5,
    description,
    manufacturer,
    categoryId,
    inStock,
  });

  console.log("Product created successfully:", product);
  return response.status(201).json(product);
});

// Method for updating existing product
const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    rating,
    description,
    manufacturer,
    categoryId,
    inStock,
  } = request.body;

  // Basic validation
  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Finding a product by id
  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Updating found product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      merchantId: merchantId,
      title: title,
      mainImage: mainImage,
      slug: slug,
      price: price,
      rating: rating,
      description: description,
      manufacturer: manufacturer,
      categoryId: categoryId,
      inStock: inStock,
    },
    { new: true }
  );

  return response.status(200).json(updatedProduct);
});

// Method for deleting a product
const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Check for related records in orders
  const CustomerOrder = require('../models/CustomerOrder');
  const relatedOrders = await CustomerOrder.find({
    'products.productId': id,
  });
  
  if(relatedOrders.length > 0){
    throw new AppError("Cannot delete product because it exists in orders", 400);
  }

  await Product.findByIdAndDelete(id);
  return response.status(204).send();
});

const searchProducts = asyncHandler(async (request, response) => {
  const { query } = request.query;
  
  if (!query) {
    throw new AppError("Query parameter is required", 400);
  }

  const products = await Product.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  }).populate('categoryId', 'name');

  return response.json(products);
});

const getProductById = asyncHandler(async (request, response) => {
  const { id } = request.params;
  
  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await Product.findById(id).populate('categoryId');

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  
  return response.status(200).json(product);
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};
