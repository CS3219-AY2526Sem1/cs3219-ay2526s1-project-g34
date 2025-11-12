// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in drafting boilerplate for an Express.js user controller function 
// (`createUser`) handling input validation, duplicate username checks, and structured 
// error handling with Sequelize ORM. Suggested consistent response formatting and 
// logging statements for debugging.
// Author review: I verified all validation logic, database queries, and error responses 
// to ensure correctness and adherence to application requirements. Controller logic, 
// route structure, and database schema design were independently determined by the team 
// prior to AI assistance.

const { User } = require('../models/index.js');
const { authService } = require('../service/authService.js');

const userController = {
    createUser: async (req, res) => {
        try {
            console.log('Request body:', req.body);
            console.log('Request headers:', req.headers);
            
            if (!req.body) {
                return res.status(400).json({ 
                    error: 'Request body is required. Make sure to include Content-Type: application/json header.' 
                });
            }
            
            if (!req.body.username) {
                return res.status(400).json({ error: 'Username is required' });
            }
            
            if (!req.body.password) {
                return res.status(400).json({ error: 'Password is required' });
            }
            
            const existingUser = await User.findOne({ where: { username: req.body.username }});
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            const user = await User.create(req.body);

            const token = authService.generateToken(user);
            res.status(201).json({ token: token, user: {
                id: user.id,
                username: user.username,
                role: user.role
            } });
        } catch (error) {
            console.error('Error in createUser:', error);
            res.status(400).json({ error: error.message })
        }
    },  
    getUser: async (req, res) => {
        try {
          const user = await User.findByPk(req.params.id);
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.json(user);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    },
};

module.exports = { userController }