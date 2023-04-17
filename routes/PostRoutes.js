


const express = require('express');
const { createPost , getPosts,deletePost,addComment} = require('../controllers/PostController');
const  addUser  = require('../middlewares/add-user');

const router = express.Router();
router.get('/all', getPosts)
router.post('/create', addUser,createPost)
router.put('/addComment', addComment)
router.delete('/:id', deletePost)

module.exports = router







