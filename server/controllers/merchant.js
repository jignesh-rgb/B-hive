const Merchant = require('../models/Merchant');

async function getAllMerchants(request, response) {
  try {
    const merchants = await Merchant.find({});
    // Transform _id to id for frontend consistency
    const transformedMerchants = merchants.map(merchant => ({
      id: merchant._id.toString(),
      name: merchant.name,
      email: merchant.email,
      phone: merchant.phone,
      address: merchant.address,
      description: merchant.description,
      status: merchant.status,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt
    }));
    return response.json(transformedMerchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return response.status(500).json({ error: "Error fetching merchants" });
  }
}

async function getMerchantById(request, response) {
  try {
    const { id } = request.params;
    const merchant = await Merchant.findById(id);

    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }

    // Transform _id to id for frontend consistency
    const transformedMerchant = {
      id: merchant._id.toString(),
      name: merchant.name,
      email: merchant.email,
      phone: merchant.phone,
      address: merchant.address,
      description: merchant.description,
      status: merchant.status,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt
    };

    return response.json(transformedMerchant);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return response.status(500).json({ error: "Error fetching merchant" });
  }
}

async function createMerchant(request, response) {
  try {
    const { name, email, phone, address, description, status } = request.body;

    const merchant = await Merchant.create({
      name,
      email,
      phone,
      address,
      description,
      status: status || "ACTIVE",
    });

    // Transform _id to id for frontend consistency
    const transformedMerchant = {
      id: merchant._id.toString(),
      name: merchant.name,
      email: merchant.email,
      phone: merchant.phone,
      address: merchant.address,
      description: merchant.description,
      status: merchant.status,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt
    };

    return response.status(201).json(transformedMerchant);
  } catch (error) {
    console.error("Error creating merchant:", error);
    return response.status(500).json({ error: "Error creating merchant" });
  }
}

async function updateMerchant(request, response) {
  try {
    const { id } = request.params;
    const { name, email, phone, address, description, status } = request.body;

    const merchant = await Merchant.findByIdAndUpdate(id, {
      name,
      email,
      phone,
      address,
      description,
      status,
    }, { new: true });

    // Transform _id to id for frontend consistency
    const transformedMerchant = {
      id: merchant._id.toString(),
      name: merchant.name,
      email: merchant.email,
      phone: merchant.phone,
      address: merchant.address,
      description: merchant.description,
      status: merchant.status,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt
    };

    return response.json(transformedMerchant);
  } catch (error) {
    console.error("Error updating merchant:", error);
    return response.status(500).json({ error: "Error updating merchant" });
  }
}

async function deleteMerchant(request, response) {
  try {
    const { id } = request.params;
    
    const merchant = await Merchant.findById(id);

    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }

    await Merchant.findByIdAndDelete(id);

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return response.status(500).json({ error: "Error deleting merchant" });
  }
}

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};