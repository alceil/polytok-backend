import { validateJWT } from '../helpers/jwt.js';
import User from '../models/user.js';

const authenticateUser = async (req, res, next) => {
  // Fetching jwt token from header
  const token = req.headers.authorization

  if (!token) {
    return res.unAuthorizedRequest('You are not logged in');
  }

  let username;
  try {
    username = validateJWT(token);
  } catch (err) {
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

export default authenticateUser;
