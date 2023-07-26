import { Router } from 'express';
import addUser from '../middlewares/add-user.js';
import authenticateUser from '../middlewares/authenticate.js';

import {  
    findTopics,
    followTopic,
    unFollowTopic,
    findSingleTopic,
    getTrendingTopics
} from '../controllers/TopicController.js';

const topicRouter = Router();
topicRouter.get('/', findTopics);
topicRouter.get('/trending', addUser, getTrendingTopics);
topicRouter.get('/single/:name', addUser, findSingleTopic);
topicRouter.post('/follow', authenticateUser, followTopic);
topicRouter.post('/unfollow', authenticateUser, unFollowTopic);

export default topicRouter;
