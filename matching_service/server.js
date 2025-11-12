require('dotenv').config({ path: '.env', debug: true })
const app = require('./src/app.js');
const PORT = process.env.PORT || 3005;







app.listen(PORT, () => {
  console.log(`Matching service running on port ${PORT}`);
});
