

const express = require('express');
const basicAuth = require('express-basic-auth');
const router = express.Router();
const user = require("./controllers/user");
const group = require("./controllers/group");
const groupMembership = require("./controllers/groupPermission");

const userName = process.env.BASE_USERNAME|| "test";
const password = process.env.BASE_PASSWORD || "test";


const auth = basicAuth({
    users: { [userName]: password }, 
    challenge: true,
    unauthorizedResponse: 'Unauthorized',
  });
  
  
router.use('/services/scim/v2', auth);

router.route('/services/scim/v2/Users')
.post(user.create)
.get(user.recon)

router.route('/services/scim/v2/Users/:id')
.get(user.getOne)
.patch(user.update)
.delete(user.deleteOne)

router.route('/services/scim/v2/Groups')
.get(group.recon)
.post(group.addGroup)


router.route('/services/scim/v2/Groups/:id')
.put(group.updateGroup)
.delete(group.deleteGroup)
.patch(groupMembership.addMembership)
.get(group.getGroup);


router.route('/services/scim/v2/BulkCreate/Users')
.post(user.bulkCreateUsers)

//router.post('/users', (req, res) => user.create(req, res));

//router.get('/users', (req, res) => user.getAll(req, res));

//router.get('/users/:id', (req, res) => user.getOne(req, res));

//router.put('/users/:id', (req, res) => user.update(req, res));

//router.delete('/users/:id', (req, res) => user.deleteOne(req, res));

module.exports = router;