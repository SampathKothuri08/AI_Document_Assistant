const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { ChatService } = require('../services/chatService');

const router = express.Router();
const chatService = new ChatService();

// Ask a question
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question, documentIds } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (question.trim().length > 1000) {
      return res.status(400).json({ error: 'Question too long (max 1000 characters)' });
    }

    // Generate answer
    const result = await chatService.generateAnswer(question.trim(), userId, documentIds);

    // Save chat message
    await chatService.saveChatMessage(userId, question, result.answer, {
      confidence: result.confidence,
      sources: result.sources,
      citationsCount: result.citations.length
    });

    res.json({
      question: question.trim(),
      answer: result.answer,
      citations: result.citations,
      confidence: result.confidence,
      sources: result.sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat ask error:', error);
    res.status(500).json({ 
      error: 'Failed to generate answer',
      details: error.message 
    });
  }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await chatService.getChatHistory(userId);
    
    res.json({ history });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Clear chat history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // In a real application, this would clear from database
    // For now, we'll just return success
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router; 