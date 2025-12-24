const Product = require('../models/Product');

async function searchProducts(request, response) {
    try {
        const { query } = request.query;
        if (!query) {
            return response.status(400).json({ error: "Query parameter is required" });
        }

        const products = await Product.find({
            $or: [
                {
                    title: {
                        $regex: query,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: query,
                        $options: 'i'
                    }
                }
            ]
        });

        return response.json(products);
    } catch (error) {
        console.error("Error searching products:", error);
        return response.status(500).json({ error: "Error searching products" });
    }
}

module.exports = { searchProducts };