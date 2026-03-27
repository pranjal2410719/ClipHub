import File from '../models/File.js';
import { getRedisClient } from '../config/redis.js';
import { getSecondsFromExpiry } from '../utils/ttl.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    const { key, expiry = '1d' } = req.body;
    const user = req.user;

    if (!key) {
      return res.status(400).json({
        error: 'Key is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Validate key format
    const keyRegex = /^[a-zA-Z0-9_-]+$/;
    if (!keyRegex.test(key)) {
      return res.status(400).json({
        error: 'Key can only contain letters, numbers, hyphens, and underscores'
      });
    }

    // Check if key already exists
    const existingFile = await File.findOne({ key });
    if (existingFile) {
      // Delete old file
      try {
        if (fs.existsSync(existingFile.path)) {
          fs.unlinkSync(existingFile.path);
        }
      } catch (err) {
        console.error('Error deleting old file:', err);
      }
      await File.findByIdAndDelete(existingFile._id);
    }

    // Create file record
    const fileRecord = new File({
      key,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: user._id,
      expiry
    });

    await fileRecord.save();

    // Also store metadata in Redis for quick access
    const redis = getRedisClient();
    const ttlSeconds = getSecondsFromExpiry(expiry);
    
    const fileMetadata = {
      id: fileRecord._id.toString(),
      key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: user._id.toString(),
      createdAt: fileRecord.createdAt.toISOString(),
      type: 'file'
    };

    await redis.setEx(`file:${key}`, ttlSeconds, JSON.stringify(fileMetadata));

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        key,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: user.name,
        url: `${req.protocol}://${req.get('host')}/api/file/${key}`
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to upload file',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { key } = req.params;
    
    // First check Redis for quick access
    const redis = getRedisClient();
    const cachedMetadata = await redis.get(`file:${key}`);
    
    let fileRecord;
    
    if (cachedMetadata) {
      const metadata = JSON.parse(cachedMetadata);
      fileRecord = await File.findById(metadata.id);
    } else {
      fileRecord = await File.findOne({ key });
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found or has expired'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(fileRecord.path)) {
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Increment download count
    fileRecord.downloadCount += 1;
    await fileRecord.save();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Type', fileRecord.mimetype);
    res.setHeader('Content-Length', fileRecord.size);

    // Stream the file
    const fileStream = fs.createReadStream(fileRecord.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      error: 'Failed to download file'
    });
  }
};

export const getFileInfo = async (req, res) => {
  try {
    const { key } = req.params;
    
    // Check Redis first
    const redis = getRedisClient();
    const cachedMetadata = await redis.get(`file:${key}`);
    
    let fileRecord;
    
    if (cachedMetadata) {
      const metadata = JSON.parse(cachedMetadata);
      fileRecord = await File.findById(metadata.id).populate('uploadedBy', 'name email');
    } else {
      fileRecord = await File.findOne({ key }).populate('uploadedBy', 'name email');
    }

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found or has expired'
      });
    }

    res.json({
      success: true,
      file: {
        key: fileRecord.key,
        originalName: fileRecord.originalName,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        downloadCount: fileRecord.downloadCount,
        uploadedBy: fileRecord.uploadedBy.name,
        createdAt: fileRecord.createdAt,
        expiresAt: fileRecord.expiresAt
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      error: 'Failed to get file info'
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    const user = req.user;

    const fileRecord = await File.findOne({ key });

    if (!fileRecord) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    // Check if user owns the file
    if (fileRecord.uploadedBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: 'You can only delete your own files'
      });
    }

    // Delete file from disk
    if (fs.existsSync(fileRecord.path)) {
      try {
        fs.unlinkSync(fileRecord.path);
      } catch (err) {
        console.error('Error deleting file from disk:', err);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(fileRecord._id);

    // Delete from Redis
    const redis = getRedisClient();
    await redis.del(`file:${key}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Failed to delete file'
    });
  }
};