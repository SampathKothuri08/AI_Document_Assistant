const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { DocumentService } = require('../services/documentService');

const router = express.Router();
const documentService = new DocumentService();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['pdf', 'docx', 'txt', 'csv'];
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const { originalname, path: filePath } = req.file;

    // Process the document
    const document = await documentService.processDocument(filePath, originalname, userId);

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        filename: document.filename,
        fileType: document.fileType,
        totalChunks: document.totalChunks,
        textLength: document.textLength,
        createdAt: document.createdAt,
        status: document.status
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error.message 
    });
  }
});

// Get user's documents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const documents = await documentService.getUserDocuments(userId);
    
    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        fileType: doc.fileType,
        totalChunks: doc.totalChunks,
        textLength: doc.textLength,
        createdAt: doc.createdAt,
        status: doc.status
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Get specific document
router.get('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;
    
    const document = await documentService.getDocumentById(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      document: {
        id: document.id,
        filename: document.filename,
        fileType: document.fileType,
        totalChunks: document.totalChunks,
        textLength: document.textLength,
        createdAt: document.createdAt,
        status: document.status
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// Delete document
router.delete('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;
    
    await documentService.deleteDocument(documentId, userId);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  if (error.message.includes('File type not allowed')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

module.exports = router; 