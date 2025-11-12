const { User } = require('../models/index.js');
const { authService } = require('../service/authService.js');

const authController = {
    login: async (req, res) => {
        try {
            const user = await User.findOne({ where: { username: req.body.username }});
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (!await user.comparePassword(req.body.password)) {
                return res.status(401).json({ error: "Incorrect username or password"})
            }
            const token = authService.generateToken(user);
            res.json({ token: token, user: {
                id: user.id,
                username: user.username,
                role: user.role
            } });
        } catch (error) {
            res.status(401).json({ error: "Incorrect username or password"})
        }
    },
    verify: async (req, res) => {
        try {
            const authHeader = req.headers.authorization
            const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.slice(7)
            : null;
            if (!token) {
                return res.status(401).json({ error: 'No token' })
            }
            const decoded = authService.verifyToken(token);
            res.status(200).json({ valid: true, userId: decoded.userId });
        } catch (error) {
            res.status(401).json({ error: error.message })
        }
    }
};

module.exports = { authController }