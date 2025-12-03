const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

const uploadToCloudinary = (fileBuffer, folder = config.cloudinary.folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } 
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const uploadMultipleToCloudinary = async (files, folder = config.cloudinary.folder) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  cloudinary
};
