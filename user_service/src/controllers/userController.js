const { User } = require('../models/index.js');

const userController = {
    createUser: async (req, res) => {
        try {
            const user = await User.create(req.body);
            res.status(201).json(user);
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