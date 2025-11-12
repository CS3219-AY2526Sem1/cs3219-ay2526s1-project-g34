// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in refactoring Sequelize database initialization logic to support both 
// environment variable–based configuration and fallback to default config values. 
// Suggested use of a `dbConfig` object to improve code clarity.
// Author review: I verified environment variable mapping, connection parameters, and 
// fallback behavior to ensure reliability across development and production environments. 
// All architectural and configuration design decisions were independently determined by the team 
// prior to AI assistance.

// AI Assistance Disclosure
// Tool: ChatGPT (GPT-5 Thinking), date: 2025-11-13
// Scope: Reviewed and refined database initialization script for Sequelize setup,
// improving environment-variable handling and code clarity.
// Author review: All changes verified to ensure proper DB connection and model loading.

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Use environment variables if available, otherwise use config
  const dbConfig = {
    database: process.env.DB_NAME || config.database,
    username: process.env.DB_USER || config.username,
    password: process.env.DB_PASSWORD || config.password,
    host: process.env.DB_HOST || config.host,
    port: process.env.DB_PORT || config.port,
    dialect: config.dialect
  };
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
