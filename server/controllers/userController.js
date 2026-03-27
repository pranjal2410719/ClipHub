import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads');

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Profile image is required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const relativePath = `/uploads/profile/${req.file.filename}`;

    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const oldPath = path.join(uploadsRoot, user.profileImage.replace('/uploads/', ''));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profileImage = relativePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      error: 'Failed to upload profile image',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
