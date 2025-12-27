const path = require('path');

async function uploadMainImage(req, res) {
    try {
      console.log('Upload request received');
      console.log('req.files:', req.files);
      console.log('req.body:', req.body);

      if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files found in request');
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Get file from request - try both possible field names
      const uploadedFile = req.files.uploadedFile || req.files.file;
      console.log('Uploaded file:', uploadedFile);

      if (!uploadedFile) {
        console.log('uploadedFile not found');
        return res.status(400).json({ message: "uploadedFile field not found" });
      }

      // Generate unique filename to avoid conflicts
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${uploadedFile.name}`;

      // Move file to the backend uploads directory
      const uploadPath = path.join(__dirname, '..', 'uploads', uniqueFileName);
      console.log('Current working directory:', process.cwd());
      console.log('Moving file to:', uploadPath);
      await uploadedFile.mv(uploadPath);

      // Return the image URL that can be accessed by the frontend
      const imageUrl = `/uploads/${uniqueFileName}`;

      res.status(200).json({
        message: "File uploaded successfully",
        imageUrl: imageUrl,
        filename: uniqueFileName
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error: error.message });
    }
  }

  module.exports = {
    uploadMainImage
};