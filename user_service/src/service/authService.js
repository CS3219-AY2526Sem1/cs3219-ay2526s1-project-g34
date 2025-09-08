const jwt = require('jsonwebtoken');
const fs = require('fs');

let privateKey;
let publicKey;

try {
    privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
    publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);
} catch (error) {
    console.log('failed to load keys')
    process.exit(1);
}

const authService = {
    generateToken: (user) => {
        try {
            const token = jwt.sign({ userId: user.id }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
            return token
        } catch (error) {
            throw new Error('Token genereation failed');
        }
        
    },
    verifyToken: (token) => {
        try {
            const payload = jwt.verify(token, publicKey);
            return payload;
        } catch (error) {
            throw new Error('Failed to decode');
        }
    },
}

module.exports = { authService }