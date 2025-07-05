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
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

function readModels(directory) {
  fs.readdirSync(directory).forEach(file => {
    const absolutePath = path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      readModels(absolutePath); // Chama recursivamente para subpastas
    } else if (file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1
  ) { 
      try {
        const model = require(absolutePath)(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      } catch (e) {
        // Loga erros se um arquivo .js não for um modelo Sequelize válido
        console.warn(`Não foi possível carregar o arquivo como modelo Sequelize: ${absolutePath}. Erro: ${e.message}`);
      }
    }
  });
}

readModels(__dirname);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
