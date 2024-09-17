const db = require("../models");
const GroupMembership = db.group_Membership;
const User = db.user;
const Group = db.group;
const Op = db.Sequelize.Op;

exports.addMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ where: { id } });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const patchOperations = req.body.Operations;

    for (const operation of patchOperations) {
      if (operation.op === "add") {
        // Handle "add" operation
        if (Array.isArray(operation.value)) {
          for (const member of operation.value) {
            const user = await User.findOne({ where: { id: member.value } });
            if (!user) {
              return res.status(404).json({ error: "User not exists: " + member.value });
            }

            // Check if a membership entry already exists for the user in the group
            const existingMembership = await GroupMembership.findOne({
              where: {
                user_id: user.id,
                group_id: group.id,
              },
            });

            // Create an object to hold the rights in key-value pairs
            const rights = {};

            // Iterate over the keys in the member object (except "value")
            for (const key in member) {
              if (key !== "value" && key !== "type") {
                rights[key] = member[key];
              }
            }

            if (existingMembership) {
              // If an entry already exists, update it with the new rights
              await existingMembership.update({
                rights: {
                  ...rights,
                },
              });
            } else {
              // If no entry exists, create a new one with the provided "user" and "rights"
              await GroupMembership.create({
                user_id: user.id,
                group_id: group.id,
                value: member.value,
                rights: rights,
              });
            }
          }
        }
      } else if (operation.op === "remove") {
        // Handle "remove" operation
        const memberValue = operation.path.match(/members\[value eq "([^"]+)"\]/)[1];
        const user = await User.findOne({ where: { id: memberValue } });
        if (!user) {
          return res.status(404).json({ error: "User not exists: " + memberValue });
        }
        await GroupMembership.destroy({
          where: {
            user_id: user.id,
            group_id: group.id,
          },
        });
      }
    }

    return res.status(200).json({ message: "Permission added/removed successfully" });
  } catch (error) {
    console.error("Error adding/removing permission:", error);
    res.status(500).json({ error: "Server error" });
  }
};





