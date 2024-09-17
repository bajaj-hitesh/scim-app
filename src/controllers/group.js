const db = require("../models");
const Group = db.group;
const Op = db.Sequelize.Op;

exports.addGroup = async (req, res, next) => {
  try {
    const body = req.body;

    let groupJson = {
      id: db.uuidv4(),
      display_name: body.display_name,
    };

    await Group.create(groupJson);
    res.json(groupJson);
  } catch (ex) {
    console.log(`Error while creating group : ${ex}`);
    res.status(500).json({ error: 'An error occurred while creating the group' });
  }
};

exports.getGroup = async (req, res, next) => {

  try {
    const groupName = req.params.id;

    const group = await Group.findOne({
      where : { display_name : groupName }
    });

    if(!group) {
      return res.status(404).json({ error: `Group with name ${groupName} not found` });
    }

    return res.status(200).json(group);

  } catch (ex) {
    console.error('Error updating group:', error);
    return res.status(500).json({ error: 'Server error' });
  }

}

exports.updateGroup = async (req, res, next) => {
  const groupId = req.params.id;
  const { display_name } = req.body;

  try {
      const group = await Group.findOne({
          where: { id: groupId }
      });

      if (!group) {
          return res.status(404).json({ error: `Group with ID ${groupId} not found` });
      }

      // Update group attribute
      group.display_name = display_name !== null ? display_name : group.display_name;
      await group.save();

      return res.status(200).json(group);
  } catch (error) {
      console.error('Error updating group:', error);
      return res.status(500).json({ error: 'Server error' });
  }
}

exports.recon = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex || 1); // Default to 1 if not provided
    const count = parseInt(req.query.count || 10); // Default to 10 if not provided

    const groupsData = await getGroupsFromDatabase(startIndex, count);

    const scimResponse = {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: groupsData.totalResults,
      startIndex: groupsData.startIndex,
      itemsPerPage: groupsData.itemsPerPage,
      Resources: await Promise.all(groupsData.resources.map(async (group) => {
        const { id, display_name, createdAt, updatedAt } = group;
        return {
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
          displayName: display_name,
          id,
          meta: {
            resourceType: "Group",
            created: createdAt,
            lastModified: updatedAt,
          }
        };
      })),
    };

    res.json(scimResponse);
  } catch (ex) {
    console.log(`Error while fetching groups: ${ex}`);
    res.status(500).json({ error: 'An error occurred while fetching groups' });
  }
};

async function getGroupsFromDatabase(startIndex, count) {
  try {
    const groupsData = await Group.findAndCountAll({
      attributes: ['id', 'display_name', 'createdAt', 'updatedAt'],
      offset: startIndex - 1, // Offset is zero-based, so subtract 1
      limit: count,
    });

    return {
      totalResults: groupsData.count,
      startIndex,
      itemsPerPage: count,
      resources: groupsData.rows,
    };
  } catch (ex) {
    console.log(`Error while fetching groups from the database: ${ex}`);
    throw ex;
  }
}

exports.deleteGroup = async (req, res) => {
  const groupId = req.params.id;

  try {
      const group = await Group.findOne({
          where: { id: groupId }
      });

      if (!group) {
          return res.status(404).json({ error: `Group with ID ${groupId} not found` });
      }

      // Delete the group
      await group.destroy();

      console.log(`Group with ID ${groupId} has been deleted`);
      return res.status(200).json({ message: `Group with ID ${groupId} has been deleted` });
  } catch (error) {
      console.error('Error deleting group:', error);
      return res.status(500).json({ error: 'Server error' });
  }
}
