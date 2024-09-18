var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
const { v4: uuidv4 } = require('uuid');
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};

// fs.readdirSync(__dirname).filter(function(file) {
//         return (file.indexOf(".") !== 0) && (file !== "index.js");
//     }).forEach(function(file) {
//         var model = sequelize.define(path.join(__dirname, file));
//         db[model.name] = model;
//     });

// Object.keys(db).forEach(function(modelName) {
//     if ("associate" in db[modelName]) {
//         db[modelName].associate(db);
//     }
// });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./user.js")(sequelize, Sequelize);
db.group = require("./group.js")(sequelize, Sequelize);
db.group_Membership = require("./Group_Membership.js")(sequelize, Sequelize);
db.uuidv4 = uuidv4;
module.exports = db;
