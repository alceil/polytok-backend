import express from 'express';
import addUser from '../middlewares/add-user.js';
import authenticateUser from '../middlewares/authenticate.js';
import { 
  loginUser,
  registerUser,
  updateProfilePic,
  updateUserDetails,
  bookmarkPost,
  unbookmarkPost,
  googleOAuth,
  forgotPassword,
  sendOTP,
  deleteAccount,
  getDetails,
  findUser,
  editDetails
} from '../controllers/AuthController.js';


const router = express.Router();
router.post('/register', registerUser)
router.post('/send-otp', sendOTP);
router.post('/google', googleOAuth)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword);
router.post('/delete-account', addUser, deleteAccount);
router.put('/updateProfilePic', updateProfilePic)
router.put('/updateUserDetails', updateUserDetails)
router.put('/bookmarkpost',addUser, bookmarkPost)
router.put('/unbookmarkpost',addUser, unbookmarkPost)
router.get('/', authenticateUser, getDetails);
router.post('/edit', authenticateUser, editDetails);
router.get('/:username', findUser);
export default router