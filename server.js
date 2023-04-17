const express = require('express');
const mongoose = require('mongoose');
const app = express();
const AuthRoute = require('./routes/AuthRoutes')
const PostsRoute = require('./routes/PostRoutes')
const cors = require('cors');
const PORT = process.env.PORT || 5000;
require('dotenv').config()
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Listening at Port ${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.get('/',(req,res)=>{
    res.send('We are legion')
})


app.use('/auth', AuthRoute);
app.use('/posts',PostsRoute)