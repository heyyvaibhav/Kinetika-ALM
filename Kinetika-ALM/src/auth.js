require("dotenv").config();
const jwt = require("jsonwebtoken");

const Jwt_Secret_Key = process.env.secret_key;

function generateToken(user) {
  const payload = {
    id: user.user_id,
    name: user.username,
    email: user.email,
    type: user.role,
  };


  //JWT token never expires as app needs it - KA31122024
  return jwt.sign(payload, Jwt_Secret_Key);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //   console.log("token is: ", token);

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  jwt.verify(token, Jwt_Secret_Key, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token." });

    // Attach the user to the request object
    req.user = user;
    next();
  });
}

module.exports = {
  generateToken,
  authenticateToken,
};
