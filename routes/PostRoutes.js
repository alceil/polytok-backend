


import { Router } from 'express';
import { createPost, getPosts, deletePost, addComment, likePost, unlikePost } from '../controllers/PostController.js';
import addUser from '../middlewares/add-user.js';

const router = Router();
router.get('/', getPosts)
router.post('/create', addUser,createPost)
router.put('/addComment',addUser, addComment)
router.delete('/:id', deletePost)
router.put('/likepost',addUser, likePost)
router.put('/unlikepost',addUser, unlikePost)

export default router







