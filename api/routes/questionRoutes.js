const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/questions/my-questions 
router.get('/my-questions', authMiddleware, questionController.getMyQuestions);

// GET /api/questions/pending
router.get('/pending', authMiddleware, questionController.getPendingQuestions);

// PUT /api/questions/:questionId/answer 
router.put('/:questionId/answer', authMiddleware, questionController.answerQuestion);

module.exports = router;
