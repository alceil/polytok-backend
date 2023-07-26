import { Schema, model } from "mongoose";
import { getMinutesBefore } from '../helpers/date.js';
import bcrypt from "bcrypt";
const userSchema = Schema({
  email: {type: String, required: true },
  password: {type: String, required: true },
  firstname: {
    type: String,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
     trim: true
  },
  username:{
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },
  profilePic:{
    type: String,
  },
  bookmarks:{
type:Array
  },
  bio:{type: String, trim: true},
  otp: {
    data: {
      type: String,
      // required: true,
    },
    generated_at: {
      type: Date,
      // required: true,
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  followed_topics: {
    type: [String],
    required: true,
  },
});


userSchema.virtual('full_name').get(function () {
  return this.last_name ? `${this.first_name} ${this.last_name}` : this.first_name;
});

userSchema.methods.verifyOTP = function (otp) {
  const { data: savedOTP, generated_at } = this.otp;

  // Finding if otp has expired
  if (getMinutesBefore(generated_at) > 10) {
    throw new Error('The otp has expired');
  }

  // Checking if given otp matches
  if (savedOTP !== otp) {
    throw new Error('OTP does not match');
  }
};

userSchema.methods.expireOTP = function () {
  this.otp.generated_at = new Date(0);
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

async function userSchemaPreSave() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  if (!this.profilePic) {
    this.profilePic = `https://avatars.dicebear.com/api/bottts/${this.username}.svg`;
  }
}

async function userSchemaPreUpdate() {
  const { password } = this.getUpdate().$set;

  if (password) {
    this.getUpdate().$set.password = await bcrypt.hash(password, 8);
  }
}

userSchema.pre('save', userSchemaPreSave);
// userSchema.pre('findOneAndUpdate', userSchemaPreUpdate);
const userModel = model("userspolytok", userSchema);
export default userModel;