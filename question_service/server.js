require('dotenv').config({ path: '.env', debug: true })
const app = require('./src/app.js');
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Question service running on port ${PORT}`);
});
