


const express = require('express');
const { createPost , getPosts,deletePost,addComment,likePost, unlikePost} = require('../controllers/PostController');
const  addUser  = require('../middlewares/add-user');

const router = express.Router();
router.get('/all', getPosts)
router.post('/create', addUser,createPost)
router.put('/addComment',addUser, addComment)
router.delete('/:id', deletePost)
router.put('/likepost',addUser, likePost)
router.put('/unlikepost',addUser, unlikePost)

module.exports = router







