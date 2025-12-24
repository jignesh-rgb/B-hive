const Image = require('../models/Image');

async function getSingleProductImages(request, response) {
  const { id } = request.params;
  const images = await Image.find({ productID: id });
  if (!images) {
    return response.json({ error: "Images not found" }, { status: 404 });
  }
  return response.json(images);
}

async function createImage(request, response) {
  try {
    const { productID, image } = request.body;
    const createdImage = await Image.create({
      productID,
      image,
    });
    return response.status(201).json(createdImage);
  } catch (error) {
    console.error("Error creating image:", error);
    return response.status(500).json({ error: "Error creating image" });
  }
}

async function updateImage(request, response) {
  try {
    const { id } = request.params; // Getting product id from params
    const { productID, image } = request.body;

    // Checking whether photo exists for the given product id
    const existingImage = await Image.findOne({
      productID: id, // Finding photo with a product id
    });

    // if photo doesn't exist, return coresponding status code
    if (!existingImage) {
      return response
        .status(404)
        .json({ error: "Image not found for the provided productID" });
    }

    // Updating photo using coresponding _id
    const updatedImage = await Image.findByIdAndUpdate(
      existingImage._id,
      {
        productID: productID,
        image: image,
      },
      { new: true }
    );

    return response.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    return response.status(500).json({ error: "Error updating image" });
  }
}

async function deleteImage(request, response) {
  try {
    const { id } = request.params;
    await Image.deleteMany({
      productID: String(id), // Converting id to string
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    return response.status(500).json({ error: "Error deleting image" });
  }
}



module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
};
