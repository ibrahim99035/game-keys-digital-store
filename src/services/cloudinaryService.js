const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

class CloudinaryService {
  
  // Upload file to Cloudinary
  async uploadFile(file, folder = 'general', options = {}) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `egyptian-store/${folder}`,
        resource_type: 'auto',
        ...options
      });

      return {
        success: true,
        cloudinaryId: result.public_id,
        url: result.secure_url,
        originalFilename: file.originalname,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, folder = 'general', options = {}) {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, options));
    return await Promise.all(uploadPromises);
  }

  // Generate secure download URL
  async generateSecureDownloadUrl(cloudinaryId, options = {}) {
    const defaultOptions = {
      resource_type: 'auto',
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      ...options
    };

    try {
      const url = cloudinary.url(cloudinaryId, {
        ...defaultOptions,
        sign_url: true
      });

      return {
        success: true,
        url: url,
        expiresAt: new Date(defaultOptions.expires_at * 1000)
      };
    } catch (error) {
      throw new Error(`Failed to generate secure URL: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  async deleteFile(cloudinaryId, resourceType = 'auto') {
    try {
      const result = await cloudinary.uploader.destroy(cloudinaryId, {
        resource_type: resourceType
      });

      return {
        success: result.result === 'ok',
        cloudinaryId: cloudinaryId,
        result: result.result
      };
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(cloudinaryIds, resourceType = 'auto') {
    const deletePromises = cloudinaryIds.map(id => this.deleteFile(id, resourceType));
    return await Promise.all(deletePromises);
  }

  // Generate image thumbnails
  async generateThumbnails(cloudinaryId, sizes = []) {
    const defaultSizes = [
      { width: 150, height: 150, crop: 'fill', suffix: 'thumb' },
      { width: 300, height: 300, crop: 'fill', suffix: 'small' },
      { width: 600, height: 600, crop: 'limit', suffix: 'medium' }
    ];

    const thumbnailSizes = sizes.length > 0 ? sizes : defaultSizes;
    const thumbnails = [];

    for (const size of thumbnailSizes) {
      const url = cloudinary.url(cloudinaryId, {
        width: size.width,
        height: size.height,
        crop: size.crop,
        quality: 'auto',
        fetch_format: 'auto'
      });

      thumbnails.push({
        size: `${size.width}x${size.height}`,
        url: url,
        suffix: size.suffix
      });
    }

    return thumbnails;
  }

  // Get file info
  async getFileInfo(cloudinaryId, resourceType = 'auto') {
    try {
      const result = await cloudinary.api.resource(cloudinaryId, {
        resource_type: resourceType
      });

      return {
        success: true,
        cloudinaryId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  // Search files
  async searchFiles(query, options = {}) {
    try {
      const result = await cloudinary.search
        .expression(query)
        .sort_by([['created_at', 'desc']])
        .max_results(options.maxResults || 50)
        .execute();

      return {
        success: true,
        files: result.resources.map(resource => ({
          cloudinaryId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          size: resource.bytes,
          createdAt: resource.created_at,
          folder: resource.folder
        })),
        totalCount: result.total_count
      };
    } catch (error) {
      throw new Error(`File search failed: ${error.message}`);
    }
  }

  // Create folder
  async createFolder(folderName) {
    try {
      const result = await cloudinary.api.create_folder(`egyptian-store/${folderName}`);
      return {
        success: true,
        folder: result.name
      };
    } catch (error) {
      throw new Error(`Folder creation failed: ${error.message}`);
    }
  }

  // Get folder contents
  async getFolderContents(folderName, options = {}) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `egyptian-store/${folderName}`,
        max_results: options.maxResults || 100,
        ...options
      });

      return {
        success: true,
        files: result.resources.map(resource => ({
          cloudinaryId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          size: resource.bytes,
          createdAt: resource.created_at
        })),
        totalCount: result.resources.length
      };
    } catch (error) {
      throw new Error(`Failed to get folder contents: ${error.message}`);
    }
  }
}

module.exports = new CloudinaryService();