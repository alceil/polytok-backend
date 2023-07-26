import { Router } from 'express';
import addUser from '../middlewares/add-user.js';

import {
  updateHasRead,
  markAllAsRead,
  findNotifications,
  deleteNotification,
  getNotificationCount,
  // sendPushNotification,
  subscribePushNotification,
  unsubscribePushNotification,
} from '../controllers/NotificationController.js';
import authenticateUser from '../middlewares/authenticate.js';

const notificationRouter = Router();

// notificationRouter.post('/send-push', sendPushNotification);
notificationRouter.get('/', authenticateUser, findNotifications);
notificationRouter.delete('/:id', authenticateUser, deleteNotification);
notificationRouter.get('/count', authenticateUser, getNotificationCount);
notificationRouter.post('/:id/has-read', authenticateUser, updateHasRead);
notificationRouter.post('/mark-all-as-read', authenticateUser, markAllAsRead);
notificationRouter.post('/subscribe', authenticateUser, subscribePushNotification);
notificationRouter.post('/unsubscribe', authenticateUser, unsubscribePushNotification);

export default notificationRouter;
