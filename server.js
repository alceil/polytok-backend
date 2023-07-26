import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
const app = express();
import AuthRoute from './routes/AuthRoutes.js';
import NotificationRoute from './routes/NotificationRoutes.js';
import PostsRoute from './routes/PostRoutes.js';
import TopicRoute from './routes/TopicRoute.js';
import cors from 'cors';
import httpErrors from './middlewares/http-errors.js';

const PORT = process.env.PORT || 5000;

dotenv.config()
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Listening at Port ${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());

// Custom HTTP Errors
app.use(httpErrors);

app.get('/',(req,res)=>{
    res.cookie(`test`, `yoyo`);
    res.send('We are legion')
})


app.use('/auth', AuthRoute);
app.use('/notifications', NotificationRoute);
app.use('/posts',PostsRoute)
app.use('/topics',TopicRoute)