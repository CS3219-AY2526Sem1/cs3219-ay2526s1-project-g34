require('dotenv').config({ path: '.env', debug: true })
const app = require('./src/app.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
