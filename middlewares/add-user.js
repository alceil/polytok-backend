import User from "../models/user.js";
import { validateJWT } from '../helpers/jwt.js';
/**
 *
 * Middleware which checks for the jwt in the request
 * and add the user to the request object if user exists.
 */
const addUser = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return next();
  }
  let username;
  try {
    username = validateJWT(token);
  } catch (err) {
    console.log(err)
    return res.forbiddenRequest('Invalid jwt token');
  }

  // Retrieving user from the database
  const user = await User.findOne({ username});
  if (!user) {
    return res.unAuthorizedRequest('User no more exist in the database');
  }
  // Adding user to the request object
  req.user = user;
  next();
};

export default addUser;
