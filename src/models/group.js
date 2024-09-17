module.exports = (sequelize, DataTypes) => {

    const Group = sequelize.define("group", {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      },
      display_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "NULL",
        unique: true
      }});
    return Group; 
  };
  