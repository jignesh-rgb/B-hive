const Product = require("../models/Product");

async function getProductBySlug(request, response) {
  const { slug } = request.params;
  const product = await Product.findOne({ slug });

  const foundProduct = product;
  if (!foundProduct) {
    return response.status(404).json({ error: "Product not found" });
  }
  return response.status(200).json(foundProduct);
}

module.exports = { getProductBySlug };
