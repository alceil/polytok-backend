import { Schema, model } from "mongoose";

const postSchema = Schema({
  author: {
    type: Schema.Types.ObjectId,
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
  likes: {
    type: Array,
  },
  avatarUrl: {
    type: String,
  }, 
  topics: {
    type: [String],
    required: true,
  },
  comments: {
    type: Array,
  }, 
  push_subscription: String,
  created_at: {
    type: Date,
    default: () => new Date(),
  },
},
{timestamp:true});

const notifModel = model("posts", postSchema);
export default notifModel;