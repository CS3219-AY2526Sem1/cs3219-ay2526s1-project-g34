const express = require('express');
const questionController = require('../controllers/questionControllers');

const router = express.Router();

router.post('/', questionController.createQuestion);
router.get('/', questionController.listQuestions);
router.get('/random', questionController.randomQuestion);
// router.get('/:id', questionController.getQuestionById);
router.patch('/:id', questionController.updateQuestionById);
router.delete('/:id', questionController.deleteQuestionById);

router.get('/topics', questionController.getUniqueTopics    );

module.exports = router;
