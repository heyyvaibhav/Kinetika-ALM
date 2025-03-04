const express = require('express');
const UsersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', UsersController.getAllUsers);
router.get('/:id', UsersController.getUserById);
router.post('/', UsersController.createUser);
router.put('/:id', UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);

module.exports = router;
