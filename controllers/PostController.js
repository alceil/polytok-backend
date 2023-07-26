
import PostModel from "../models/post.js";
import TopicModel from "../models/topic.js";
import mongoose from 'mongoose';
import { stringToBoolean } from '../helpers/convertors.js';
import {
  validateNumber,
  validateString,
  validateBoolean,
  validateMongooseId,
  validateStringArray,
  validateURL,
} from '../helpers/validation.js';
 const getPosts = async (req, res) => {
 const { user } = req;
 const { topic, search, user_id, before_id, after_id, following = 'false' } = req.query;

 let { page_size = 5 } = req.query;
 page_size = parseInt(page_size, 10);

 // Validating request body
 try {
   validateString(topic, 2, 30, 'topic', false);
   validateString(search, 0, 50, 'search', false);
   validateMongooseId(before_id, 'before_id', false);
   validateMongooseId(after_id, 'after_id', false);
   validateNumber(page_size, 5, 50, 'page_size', false);
   validateMongooseId(user_id, 'user_id', false);
   validateBoolean(stringToBoolean(following), 'following', false);
 } catch (err) {
   return res.badRequest(err.message);
 }
 
 const query = {};

 // Adding search based filter if search is provided
 if (search) {
   query.$text = { $search: search };
 }

 // Adding user following based filter if following is provided
 if (stringToBoolean(following) && user) {
   const topicsUserFollows = user.followed_topics;
   if (topicsUserFollows.length !== 0) {
     query.topics = { $elemMatch: { $in: topicsUserFollows } };
   }
 }

 // Adding topic based filter if topic exist in query
 if (topic) {
   query.topics = { $elemMatch: { $eq: topic } };
 }

 // Adding user based filter if user_id is provided
 if (user_id) {
   query.author = user_id;
 }

 // If after_id is provided only include questions posted after after_id
 if (after_id) {
   query._id = { $gt: after_id };
 } else if (before_id) {
   query._id = { $lt: before_id };
 }


 const posts = await PostModel.find(query)
   .sort({ _id: 'descending' })
   .populate('author', 'username profilePic firstname lastname')
   .limit(page_size)
   .select('-__v')
   .lean();

 res.status(200).json({
   msg: 'Posts found',
   posts,
 });
  };

  const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
      if (id) {
        const getDeletedData = await PostModel.findByIdAndDelete(id);
        return res.status(200).json(getDeletedData);
      } else {
        return res.status(400).json({ message: "Id not found" });
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  };

  const addComment = async (req, res) => {
    const { user } = req;
    const { id:post_id,content} = req.body;
   const {firstname,lastname,profilePic,username} = user;
   const session = await mongoose.startSession();

   const post = await PostModel.findById(post_id)
   .select('title author')
   .populate('author')
   .lean();

 // Checking if question exist
 if (!post) {
   return res.notFound('Question does not exist');
 }


    // console.log(req.body)
    try {
      if (id) {
        await session.withTransaction(async () => {
          await NotificationController.createNotification(
            {
              sender: user._id,
              message: post.title,
              type: 'added-opinion',
              receiver: post.author._id,
              targetContentId: post._id,
            },
            { session }
          );
        });
        const addComment = await PostModel.findByIdAndUpdate(id, { $push:{comments:{content,firstname,lastname,profilePic,username}}},{ new: true });
        return res.status(200).json(addComment);
      } else {
        return res.status(400).json({ message: "Id not found" });
      }
    } catch (error) {
      console.log(error)
      return res.status(400).json(error);
    }
  };


//  const createPost = async (req, res) => {
//   const { user } = req;
//   const { _id: author } = user;
//   const tempPost = new PostModel(
//   req.body
//     );
// tempPost.author = author;
//     console.log(tempPost)
//   try {
//     await tempPost.populate('author','firstname lastname username profilePic')
//     const post = await tempPost.save();
//     res.status(200).json({ post});
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
//   };

  const createPost = async (req, res) => {
    const { user } = req;

    const { title, description, imageUrl, topics } = req.body;

    // Validating request body
    try {
      validateString(title, 15, 150, 'title', true);
      validateString(description, 30, 1600, 'content', true);
      // validateStringArray(options, 1, 30, 'options', 2, 5, true);
      validateURL(imageUrl, 'url', true);
      validateStringArray(topics, 2, 30, 'topics', 1, 5, true);
    } catch (err) {
      console.log(err)
      return res.badRequest(err.message);
    }

    // Checking if all provided topics are valid
    const topicInDBCount = await TopicModel.countDocuments({ name: { $in: topics } });
    if (topicInDBCount !== topics.length) {
      return res.badRequest('Some or all topics provided does not exist');
    }

    const { _id: author } = user;
    const post = new PostModel({
      title,
      author,
      description,
      imageUrl,
      topics,
    });

    try {
      await post.populate('author','firstname lastname username profilePic')
      await post.save();
    } catch (err) {
      return res.internalServerError('Error creating post');
    }

    res.status(200).json({ msg: 'Post successfully created' });
  };



   const likePost = async (req, res) => {
    const { user } = req;
    const { postId } = req.body;
    let userId = user._id
    try {
      const post = await PostModel.findByIdAndUpdate(postId,{ $addToSet: { likes: userId } },{ new: true });
         res.status(200).json(post);
      // }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  const unlikePost = async (req, res) => {
    const { user } = req;
    const { postId } = req.body;
    let userId = user._id
    try {
      console.log(postId)
      const post = await PostModel.findByIdAndUpdate(postId,{ $pull: { likes: userId } },{ new: true });
        console.log(post)
        console.log("unlike")
        res.status(200).json(post);
    } catch (error) {
      res.status(500).json(error);
    }
  };


export {
    getPosts,
    createPost,
    deletePost,
    addComment,
    likePost,
    unlikePost
  }