const UsersModel = require('../models/usersModel');
const { successResponse, errorResponse } = require('../views/responseHandler');

class UsersController {
  static async getAllUsers(req, res) {
    try {
      const { status, role } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (role) filters.role = role;
      
      const users = await UsersModel.getAllUsers(filters);
      successResponse(res, users, 'Users retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UsersModel.getUserById(req.params.id);
      if (!user) return errorResponse(res, 'User not found', 404);
      successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async createUser(req, res) {
    try {
      const result = await UsersModel.createUser(req.body);

      if (result.exists) {
          return res.status(200).json({
              message: 'Warning: User with this email or username already exists',
              warning: true
          });
      }

      successResponse(res, { user_id: result.insertId }, 'User created successfully', 201);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async updateUser(req, res) {
    try {
      await UsersModel.updateUser(req.params.id, req.body);
      successResponse(res, null, 'User updated successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  static async deleteUser(req, res) {
    try {
      await UsersModel.deleteUser(req.params.id);
      successResponse(res, null, 'User deleted successfully', 204);
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = UsersController;
