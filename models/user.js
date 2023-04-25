const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  username: {
    type: String,
  },
  profilePic:{
    type: String,
  },
  bookmarks:{
type:Array
  },
  bio:{
    type: String,
  }
});

const userModel = mongoose.model("userspolytok", userSchema);
module.exports= userModel;