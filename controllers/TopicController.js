

import Topic from '../models/topic.js';
import mongoose from 'mongoose';
import {
  validateNumber,
  validateString,
  validateMongooseId,
  validateStringArray,
} from '../helpers/validation.js';

const findSingleTopic = async (req, res) => {
    const { user } = req;
    const { name } = req.params;
    console.log(req.params)

    // Validating request body
    try {
      validateString(name, 2, 30, name, true);
    } catch (err) {
      return res.badRequest(err.message);
    }

    let addIsUserFollowingField = {};
    if (user && user.followed_topics) {
      addIsUserFollowingField = {
        followed_by_user: { $cond: [{ $in: ['$name', user.followed_topics] }, true, false] },
      };
    }

    const topics = await Topic.aggregate([
      { $match: { name } },
      {
        $lookup: {
          from: 'posts',
          localField: 'name',
          foreignField: 'topics',
          as: 'posts',
        },
      },
      {
        $addFields: {
          question_count: { $size: '$posts' },
          ...addIsUserFollowingField,
        },
      },
      { $unset: ['__v', 'posts'] },
    ]);

    if (!topics || !topics[0]) {
      return res.notFound('Topic not found');
    }

    res.status(200).json({ data: { topic: topics[0] } });
  };

  const findTopics = async (req, res) => {
    const { user } = req;
    const { search, before_id, after_id } = req.query;

    let { page_size = 5 } = req.query;
    page_size = parseInt(page_size, 10);

    // Validating request body
    try {
      validateMongooseId(before_id, 'before_id', false);
      validateMongooseId(after_id, 'after_id', false);
      validateNumber(page_size, 1, 50, 'page_size', false);
      validateString(search, 0, 30, 'search', false);
    } catch (err) {
      return res.badRequest(err.message);
    }

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // If after_id is provided only include topics posted after after_id
    if (after_id) {
      query._id = { $gt: mongoose.Types.ObjectId(after_id) };
    } else if (before_id) {
      query._id = { $lt: mongoose.Types.ObjectId(before_id) };
    }

    let isUserFollowingQuery = {};
    if (user && user.followed_topics) {
      isUserFollowingQuery = {
        followed_by_user: { $cond: [{ $in: ['$name', user.followed_topics] }, true, false] },
      };
    }

    const topicsArray = await Topic.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
      { $limit: page_size },
      {
        $lookup: {
          from: 'posts',
          localField: 'name',
          foreignField: 'topics',
          as: 'posts',
        },
      },
      {
        $addFields: {
          question_count: { $size: '$posts' },
          ...isUserFollowingQuery,
        },
      },
      { $unset: ['__v', 'posts'] },
    ]);

    res.status(200).json({
      msg: 'Topics Found',
      data: { topics: topicsArray },
    });
  };

  const getTrendingTopics = async (req, res) => {
    const { user } = req;

    let { page_size = 5 } = req.query;
    page_size = parseInt(page_size, 10);

    // Validating request body
    try {
      validateNumber(page_size, 1, 50, 'page_size', false);
    } catch (err) {
      return res.badRequest(err.message);
    }

    let isUserFollowingQuery = {};
    if (user && user.followed_topics) {
      isUserFollowingQuery = {
        followed_by_user: { $cond: [{ $in: ['$name', user.followed_topics] }, true, false] },
      };
    }

    const topicsArray = await Topic.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: 'name',
          foreignField: 'topics',
          as: 'questions',
        },
      },
      {
        $addFields: {
          question_count: { $size: '$questions' },
          ...isUserFollowingQuery,
        },
      },
      { $unset: ['__v', 'questions'] },
      { $sort: { question_count: -1 } },
      { $limit: page_size },
    ]);

    res.status(200).json({
      msg: 'Topics Found',
      data: { topics: topicsArray },
    });
  };

  const followTopic = async (req, res) => {
    const { user } = req;
    const { topics } = req.body;

    // Validating request body
    try {
      validateStringArray(topics, 2, 30, 'topics', 1, 100, true);
    } catch (err) {
      return res.badRequest(err.message);
    }

    // Checking if all provided topics are valid
    const topicInDBCount = await Topic.countDocuments({ name: { $in: topics } });
    if (topicInDBCount !== topics.length) {
      return res.badRequest('Some or all topics provided does not exist');
    }

    // Creating new followed topics list
    const newUserFollowedTopics = [...user.followed_topics, ...topics];

    // Removing duplicates from list
    user.followed_topics = [...new Set(newUserFollowedTopics)];

    try {
      await user.save();
    } catch (err) {
      return res.internalServerError("Couldn't update followed topics");
    }

    res.status(200).json({ msg: 'Updated followed topics successfully' });
  };

  const unFollowTopic = async (req, res) => {
    const { user } = req;
    const { topics: topicsToUnfollow } = req.body;

    // Validating request body
    try {
      validateStringArray(topicsToUnfollow, 2, 30, 'topics', 1, 100, true);
    } catch (err) {
      return res.badRequest(err.message);
    }

    // Removing the topics from user followed list
    user.followed_topics = user.followed_topics.filter(
      (topic) => !topicsToUnfollow.includes(topic)
    );

    try {
      await user.save();
    } catch (err) {
      return res.internalServerError("Couldn't update followed topics");
    }

    res.status(200).json({ msg: 'Updated followed topics successfully' });
  };

export
{
    unFollowTopic,
    followTopic,
    getTrendingTopics,
    findTopics,
    findSingleTopic
  }