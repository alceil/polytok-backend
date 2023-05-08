const User = require("../models/user");
/**
 *
 * Middleware which checks for the jwt in the request
 * and add the user to the request object if user exists.
 */
const addUser = async (req, res, next) => {
const {username} = req.body;
// Retrieving user from the database
  const user = await User.findOne({ username, verified: true });

  if (!user) {
    return res.unAuthorizedRequest('User no more exist in the database');
  }

  // Adding user to the request object
  req.user = user;
  next();
};

module.exports= addUser;
