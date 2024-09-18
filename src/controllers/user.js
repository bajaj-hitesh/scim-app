const db = require("../models");
const Group_Membership = require("../models/Group_Membership");
const { use } = require("../routes");
const User = db.user;
const Group = db.group;
const GroupMembership = db.group_Membership;
const Op = db.Sequelize.Op;
const { UniqueConstraintError } = require("sequelize");

// Create and Save a new User
exports.create = async(req, res, next) => {

  console.log(`create user request received`);

  try {
    const { userName, emails,name } = req.body;
    const email = emails[0].value;
    const displayName = userName ;

    const newUser = await User.create({ userName, displayName, email });

    const scimResponse = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      id: newUser.id,
      userName: newUser.userName,
      displayName: newUser.displayName,
      email: newUser.email,
    };

    res.status(201).json(scimResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof UniqueConstraintError) {
      // Handle unique constraint violation (duplicate username or email)
      res.status(409).json({ error: "User already exists.Username and email must be unique" });
    } else {
      // Handle other errors
      res.status(500).json({ error: "Server error" });
    }
  }
};

exports.getAll = async(req, res) => {
  
   try {
    const startIndex = parseInt(req.query.startIndex) || 1;
    const count = parseInt(req.query.count) || 10;

    const users = await User.findAll({
      offset: startIndex - 1,
      limit: count,
      attributes: ["id", "userName", "displayName", "email"],
    });

    const totalUsersCount = await User.count();
    
    const scimResponse = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: totalUsersCount,
      startIndex: startIndex,
      itemsPerPage: users.length,
      Resources: users,
    };

    res.json(scimResponse);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getOne = async(req, res) => {
  const userId = req.params.id;

  try {
      const user = await User.findOne({
          where: { id: userId }
      });

      if (!user) {
          return res.status(404).json({ error: `User with ID ${userId} not found` });
      }

      return res.status(200).json(user);
  } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Server error' });
  }
}

exports.update = async (req, res, next) => {
  const userId = req.params.id;
  const { Operations, schemas } = req.body;

  try {
    const user = await User.findOne({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: `User with ID ${userId} not found` });
    }

    // Check if the payload includes the expected SCIM schema and Operations array
    if (!schemas || !schemas.includes("urn:ietf:params:scim:api:messages:2.0:PatchOp") || !Array.isArray(Operations)) {
      return res.status(400).json({ error: "Invalid or missing 'schemas' or 'Operations' property" });
    }

    // Loop through the Operations array and apply the updates
    for (const operation of Operations) {
      if (operation.op === "replace") {
        const path = operation.path;
        const value = operation.value;

        // Update user attributes based on the path and value
        if (path === "userName") {
          user.userName = value;
        } else if (path === "displayName") {
          user.displayName = value;
        } else if (path === "email") {
          user.email = value;
        } else if ( path == "active"){
          user.active = value;
        }
      }
      // You can add support for other operation types like "add," "remove," etc., as needed.
    }

    // Save the updated user
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



exports.deleteOne = async(req, res, next) => {
  const userId = req.params.id;
  try {
      const user = await User.findOne({
          where: { id: userId }
      });

      if (!user) {
          return res.status(404).json({ error: `User with ID ${userId} not found` });
      }

      // Delete the user
      await user.destroy();

      return res.status(200).json({ message: `User with ID ${userId} has been deleted` });
  } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Server error' });
  }
}

exports.recon = async (req, res, next) => {
  try {
    console.log(`get users recon request received`);

    const startIndex = parseInt(req.query.startIndex) || 1;
    const count = parseInt(req.query.count) || 10;

    const [users, totalUsersCount] = await Promise.all([
      User.findAll({
        offset: startIndex - 1,
        limit: count,
        attributes: ["id", "userName", "displayName", "email","active"],
      }),
      User.count(),
    ]);

    const userIds = users.map(user => user.id);

    const permissions = await GroupMembership.findAll({
      where: { user_id: userIds },
      attributes: ['user_id', 'group_id', 'rights']
    });

    const groupIds = permissions.map(permission => permission.group_id);

    const groups = await Group.findAll({
      where: { id: groupIds },
      attributes: ['id', 'display_name']
    });

    const groupMap = new Map(groups.map(group => [group.id, group]));

    const usersWithMemberships = await Promise.all(users.map(async user => {
      const userPermissions = permissions.filter(permission => permission.user_id === user.id);
      const memberships = await Promise.all(userPermissions.map(async permission => {
        const group = groupMap.get(permission.group_id);
        return {
          id: group.id,
          $ref :`..Groups/${group.id}`,
          display: group.display_name,
          ...permission.rights
        };
      }));
      return {
        schemas: [
          "urn:ietf:params:scim:schemas:core:2.0:User",
        ],
        id: user.id,
        userName: user.userName,
        displayName: user.displayName,
        active:user.active,
        email: [
          {
              "primary": true,
              "type": "work",
              "value": user.email
          }
      ],
        groups: memberships,
      };
    }));

    const scimResponse = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: totalUsersCount,
      startIndex: startIndex,
      itemsPerPage: usersWithMemberships.length,
      Resources: usersWithMemberships,
    };


    res.json(scimResponse);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.bulkCreateUsers = async (req, res) => {
  try {
    const totalUsers = 1000; 
    const dummyUsers = [];

    for (let i = 1; i <= totalUsers; i++) {
      dummyUsers.push({
        userName: `user${i}`,
        displayName: `User ${i}`,
        email: `user${i}@example.com`,
      });
    }

    await User.bulkCreate(dummyUsers);

    res.status(200).json({ message: `Inserted ${totalUsers} dummy users.` });
  } catch (error) {
    console.error('Error inserting dummy users:', error);
    res.status(500).json({ error: 'An error occurred while inserting dummy users.' });
  }
}
