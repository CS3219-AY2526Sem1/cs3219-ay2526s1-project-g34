const express = require('express');
const matchingController = require('../controllers/matchingControllers');


const router = express.Router();
router.post('/', matchingController.findMatch);
router.get('/status', matchingController.getMatchStatus);
router.post('/cancel', matchingController.cancelMatch);



module.exports = router;