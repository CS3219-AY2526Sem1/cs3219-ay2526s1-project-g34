const { User } = require('../models/index.js');
const { authService } = require('../service/authService.js');

const userController = {
    createUser: async (req, res) => {
        try {
            const existingUser = await User.findOne({ where: { username: req.body.username }});
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            const user = await User.create(req.body);

            const token = authService.generateToken(user);
            res.status(201).json({ token: token, user: {
                id: user.id,
                username: user.username
            } });
        } catch (error) {
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