const { User } = require('../models/index.js');

const authController = {
    login: async (req, res) => {
        try {
            const user = await User.findOne({ where: { username: req.body.username }});
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await user.comparePassword(req.body.password);
            res.json(user);
        } catch (error) {
            res.status(401).json({ error: "Incorrect username or password"})
        }
    },
};

module.exports = { authController }