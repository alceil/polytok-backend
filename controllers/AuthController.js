import UserModel from "../models/user.js";
import Post from "../models/post.js";
import bcrypt from "bcrypt";
import mongoose from 'mongoose';
import { getFutureDate } from '../helpers/date.js';
import { verifyGoogleIdToken } from '../helpers/oauth.js';
import {
  validateString,
  validateEmail,
  validatePassword,
  validateUsername,
  validateName
} from '../helpers/validation.js';

import { generateOTP, generateRandomPassword } from '../helpers/general.js';

import { sendOTP as sendOTPToEmail } from '../helpers/email.js';
import { generateJWT } from "../helpers/jwt.js";
import { createNotification } from "./NotificationController.js";



// // Register new user
//  const registerUser = async (req, res) => {

//   // const salt = await bcrypt.genSalt(10);
//   // const hashedPass = await bcrypt.hash(req.body.password, salt);
//   // req.body.password = hashedPass
//   const newUser = new UserModel(req.body);
//   const {username} = req.body
//   try {
//     // addition new
//     const oldUser = await UserModel.findOne({ username });

//     if (oldUser)
//       return res.status(400).json({ message: "User already exists" });
//       const token = generateJWT(newUser.username);
//     // changed
//     const user = await newUser.save();
//     // loginUserCookie(res, username);
//     res.status(200).json({ user ,token});
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: error.message });
//   }
// };

const registerUser = async (req, res) => {
  const { firstname, lastname, password, username, email } = req.body;

  // Validating request body
  try {
    validateEmail(email, 'email', true);
    validateString(lastname, 1, 30, 'lastname');
    validateName(firstname, 'firstname', true); 
    validatePassword(password, 'password', true);
    validateUsername(username, 'username', true);
  } catch (err) {
    return res.badRequest(err.message);
  }

  // Checking if user with the given email already exist
  const doesEmailExist = await UserModel.exists({ email});
  if (doesEmailExist) {
    return res.conflict(`Email ID ${email} already exist`);
  }

  // Checking if user with the given username already exist
  const doesUsernameExist = await UserModel.exists({ username});
  if (doesUsernameExist) {
    return res.conflict(`Username ${username} already exist`);
  }

  // // Deleting data of users with same credentials who are not verified
  // await User.deleteMany({ $or: [{ username }, { email }], verified: false });

  // Generating the OTP
  // const otp = { data: generateOTP(6), generated_at: new Date() };

  // Creating the user
  const user = new UserModel({
    // otp,
    email,
    password,
    username,
    lastname,
    firstname,
  });

  // Saving user to the database
  try {
    await user.save();
  } catch (err) {
    console.log(err)
    return res.internalServerError('Error creating user');
  }

  // // Sending OTP to the user
  // try {
  //   await sendOTPToEmail(otp.data, email, firstname);
  // } catch (err) {
  //   return res.internalServerError('Error sending OTP');
  // }
  const token = generateJWT( user.username);
  res.status(201).json({ msg: 'User created successfully',user,token });
};


// Login User

// Changed
//  const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await UserModel.findOne({ email: email });

//     if (user) {
//       const validity = await bcrypt.compare(password, user.password);

//       if (!validity) {
//         res.status(400).json("wrong password");
//       } else {
//         // loginUserCookie(res, user.username);
//         const token = generateJWT( user.username);
//         res.status(200).json({ user,token });
//       }
      
//     } else {
//       res.status(404).json("User not found");
//     }
//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err);
//   }
// };



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validating request body
  try {
    validatePassword(password, 'password', true);
    validateEmail(email, 'email', true);
  } catch (err) {
    return res.badRequest(err.message);
  }

  const user = await UserModel.findOne({ email});

  // Checking if user exist or not.
  if (!user) {
    return res.notFound(`User with email ${email} do no exist`);
  }

  // Comparing password
  const doesPasswordMatch = await user.comparePassword(password);
  if (!doesPasswordMatch) {
    return res.unAuthorizedRequest('Password does not match');
  }

  // this.#loginUser(res, username);
  const token = generateJWT( user.username);
  res.status(200).json({ message: 'Successfully Logged In',user,token });
};


const googleOAuth = async (req, res) => {
  
  const { token, type } = req.body;

  // Getting user details from google
  let ticket;
  try {
    // console.log(token)
    ticket = await verifyGoogleIdToken(token);
    console.log(ticket)
  } catch (err) {
    console.log(err)
    return res.badRequest('Invalid token');
  }

  const {
    email,
    given_name: firstname,
    family_name: lastname,
    picture: profilePic,
  } = ticket.getPayload();
console.log(email)
  // Checking for existing user with given credentials
  let user = await UserModel.findOne({ email});
console.log(user)
  // Creating new user if user does not exist
  if (!user) {
    if (type === 'login') {
      return res.notFound('User not found');
    }
    // Generating dummy data
    const otp = { data: generateOTP(6), generated_at: new Date(0) };
    const password = generateRandomPassword(10);
    user = new UserModel({
      // otp,
      email,
      password,
      lastname,
      firstname,
      // verified: true,
      profilePic,
      username: Date.now().toString(),
    });

    try {
      await user.save();
    } catch (err) {
      return res.internalServerError('Error creating new user');
    }
  }else{
    res.status(200).json({ user,msg: 'Logged In Successfully' });

  }

  // this.#loginUser(res, user.username);
};

const findUser = async (req, res) => {
  const { username } = req.params;

  // Validating request body
  try {
    validateUsername(username, 'username', true);
  } catch (err) {
    return res.badRequest(err.message);
  }

  const user = await UserModel.findOne({ username})
    .select('-password -__v -otp -verified -push_subscription')
    .lean();

  if (!user) {
    return res.notFound('User not found');
  }

  res.status(200).json({ msg: 'User Found', data: { user } });
};

const getDetails = async (req, res) => {
  const { user: loggedInUser } = req;

  // Removing unwanted fields
  const { password, __v, otp, verified, push_subscription, ...user } = loggedInUser.toJSON();

  res.status(200).json({ msg: 'User Found', data: { user } });
};





const forgotPassword = async (req, res) => {
  const { otp, new_password, email } = req.body;
  console.log(otp)

  // Validating request body
  try {
    validateEmail(email, 'email', true);
    validateString(otp, 6, 6, 'otp', true);
    validatePassword(new_password, 'new_password', true);
  } catch (err) {
    console.log(err)
    return res.badRequest(err.message);
  }

  const user = await UserModel.findOne({ email, verified: true });

  // Checking if user exist or not.
  if (!user) {
    return res.notFound(`User with email ${email} do no exist`);
  }

  // Verifying the OTP
  try {
    user.verifyOTP(otp);
  } catch (err) {
    return res.badRequest(err.message);
  }

  // Expiring the OTP
  user.expireOTP();

  user.password = new_password;

  // Starting a transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await user.save({ session });
      await createNotification(
        {
          message: 'The password of your account was changed recently',
          type: 'changed-password',
          receiver: user._id,
        },
        { session }
      );
    });
  } catch (err) {
    console.log(err)
    return res.internalServerError('Password could not changed');
  }

  // try {
  //   sendPushNotification(
  //     user.push_subscription,
  //     'Password Changed',
  //     'The password of your account was changed recently'
  //   );
  // } catch (err) {
  //   console.log('Error sending push notification'); // eslint-disable-line no-console
  // }

  res.status(200).json({ message: 'Password changed successfully' });
};


  const sendOTP = async (req, res) => {
    const { email } = req.body;

    // Validating request body
    try {
      validateEmail(email, 'email', true);
    } catch (err) {
      return res.badRequest(err.message);
    }

    const user = await UserModel.findOne({ email, verified: true });

    // Checking if user exist or not.
    if (!user) {
      return res.notFound(`User with email ${email} do no exist`);
    }

    // Creating an OTP object
    const otp = { data: generateOTP(6), generated_at: new Date() };
    user.otp = otp;

    try {
      await user.save();
    } catch (err) {
      return res.internalServerError('Error saving Details');
    }

    // Sending OTP to the user
    try {
      await sendOTPToEmail(otp.data, email, user.firstname);
    } catch (err) {
      return res.internalServerError('Error sending OTP');
    }

    res.status(201).json({ message: 'OTP send' });
  };


const updateProfilePic = async (req, res) => {
  const {id,imageUrl} = req.body

  try {
    // addition new
     await UserModel.findByIdAndUpdate(id,{
      $set: { profilePic: imageUrl },
    },{useFindAndModify :false,upsert: true,new: true}).then((response)=>{
      res.status(200).json({  message: response  });
    })
    .catch((err)=>{
      res.status(200).json({  message: err  });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const { user } = req;
  const { password } = req.body;

  // // Validating request body
  // try {
  //   validatePassword(password, 'password', true);
  // } catch (err) {
  //   console.log(err)
  //   return res.badRequest(err.message);
  // }

  // Verifying if password matches
  const doesPasswordMatch = await user.comparePassword(password);
  if (!doesPasswordMatch) {
    return res.unAuthorizedRequest('Password does not match');
  }

  // Starting a transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Post.deleteMany({ author: user._id }, { session });
      // await Opinion.deleteMany({ author: user._id }, { session });
      // await Picture.deleteMany({ username: user.username }, { session });
      // await Notification.deleteMany(
      //   { $or: [{ sender: user._id }, { receiver: user._id }] },
      //   { session }
      // );
      await user.delete({ session });
    });
  } catch (err) {
    console.log(err)
    return res.internalServerError('Error deleting question');
  }

  // const isProduction = process.env.NODE_ENV === 'production';

  // Deleting httpOnly cookie to logout the user
  // res.clearCookie('jwt', { sameSite: isProduction ? 'none' : undefined, secure: isProduction });
  res.status(200).json({ msg: 'Account deleted successfully' });
};


const updateUserDetails = async (req, res) => {
  const {id,bio,firstname,lastname} = req.body

  try {
  const updateUser= await UserModel.findByIdAndUpdate(id,{bio,firstname,lastname},{ new: true }).then((response)=>{
      res.status(200).json({  message: response  });
    })
    .catch((err)=>{
      res.status(200).json({  message: err  });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

const editDetails = async (req, res) => {
  const { user } = req;
  const { firstname, lastname, bio } = req.body;

  // Validating request body
  try {
    validateName(firstname, 'firstname');
    validateString(lastname, 1, 30, 'lastname');
    validateString(bio, 5, 160, 'bio');
  } catch (err) {
    return res.badRequest(err.message);
  }

  user.bio = bio || user.bio;
  user.lastname = lastname || user.lastname;
  user.firstname = firstname || user.firstname;

  try {
    await user.save();
  } catch (err) {
    return res.internalServerError('Error updating the details');
  }

  res.status(200).json({ msg: 'User details updated successfully' ,user});
};


const bookmarkPost = async (req, res) => {
  const { user } = req;
  const { postData} = req.body;
  console.log("Bookmark")
  console.log(postData)
 const {_id} = user;
  // console.log(req.body)
  try {
    if (_id) {
      const user = await UserModel.findByIdAndUpdate(_id, { $addToSet:{bookmarks:postData}},{ new: true });
      return res.status(200).json(user);
    } else {
      return res.status(400).json({ message: "Id not found" });
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json(error);
  }
};

const unbookmarkPost = async (req, res) => {
  const { user } = req;
  const { postId } = req.body;
  let userId = user._id
  try {
    const user = await UserModel.findByIdAndUpdate(userId,{ 
    $pull: { bookmarks: {_id: postId} } 
  },{useFindAndModify :false,upsert: true,new: true});
  //  const temppost   = await post.save();
   console.log(user)

      res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

export {
  registerUser,
  loginUser,
  deleteAccount,
  updateProfilePic,
  updateUserDetails,
  bookmarkPost,
  unbookmarkPost,
  forgotPassword,
  googleOAuth,
 sendOTP,
 getDetails,
 editDetails,
 findUser
};
