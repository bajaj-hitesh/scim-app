const dbConfig = require("../config.js").postgresDB;

const Sequelize = require("sequelize");
const { v4: uuidv4 } = require('uuid');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: process.env.DB_HOST,
  dialect: dbConfig.dialect,
  port: process.env.DB_PORT,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize
};

db.user = require("./user.js")(sequelize, Sequelize);
db.group = require("./group.js")(sequelize, Sequelize);
db.group_Membership = require("./Group_Membership.js")(sequelize, Sequelize);
db.uuidv4 = uuidv4;
module.exports = db;