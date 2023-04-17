const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userspolytok',
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  }, 
  avatarUrl: {
    type: String,
  }, 
  comments: {
    type: Array,
  }, 
  created_at: {
    type: Date,
    default: () => new Date(),
  },
},
{timestamp:true});

const notifModel = mongoose.model("posts", postSchema);
module.exports= notifModel;