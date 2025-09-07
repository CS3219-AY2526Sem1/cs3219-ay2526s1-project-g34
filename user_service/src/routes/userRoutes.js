const express = require('express');
const { userController } = require('../controllers/userController');

const userRoutes = express.Router();

userRoutes.post('/', userController.createUser);
userRoutes.get('/:id', userController.getUser);

module.exports = userRoutes;
