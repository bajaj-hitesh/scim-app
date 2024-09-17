const Group = require('./group')
module.exports = (sequelize, DataTypes) => {
  const Group_Membership = sequelize.define("Group_Membership", {
    group_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rights: {
      type: DataTypes.JSONB, // Use DataTypes.JSONB to store JSON data
      allowNull: false,
      defaultValue: {},
    },
  });

  Group_Membership.belongsTo(Group(sequelize, DataTypes), {
    foreignKey: 'group_id',
    onDelete: 'CASCADE',
  });

  return Group_Membership;
};
