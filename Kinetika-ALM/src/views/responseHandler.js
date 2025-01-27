// responseHandler.js

// Function for success responses
const successResponse = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message: message,
      data: data
    });
  };
  
  // Function for error responses
  const errorResponse = (res, error, message = "Something went wrong", statusCode = 500) => {
    return res.status(statusCode).json({
      status: 'error',
      message: message,
      error: error
    });
  };
  
  module.exports = {
    successResponse,
    errorResponse
  };
  