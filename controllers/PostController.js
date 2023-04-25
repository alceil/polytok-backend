
const PostModel = require("../models/post");

 const getPosts = async (req, res) => {
 const {user_id} =req.query
 console.log(req.query)
 console.log(user_id)
  try {
    const query = {}
    if(user_id){
      query.author = user_id
      console.log(query)
    }
    const allNotif = await PostModel.find(query).sort({ _id: -1 }).populate('author','username profilePic firstname lastname');
    if (allNotif) {
      return res.status(200).json(allNotif);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
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
    const { id,content} = req.body;
   const {firstname,lastname,profilePic,username} = user;
    // console.log(req.body)
    try {
      if (id) {
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


 const createPost = async (req, res) => {
  const { user } = req;
  const { _id: author } = user;
  const tempPost = new PostModel(
  req.body
    );
tempPost.author = author;
    console.log(tempPost)
  try {
    await tempPost.populate('author','firstname lastname username profilePic')
    const post = await tempPost.save();
    res.status(200).json({ post});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  };

   const likePost = async (req, res) => {
    const { user } = req;
    const { postId } = req.body;
    let userId = user._id
    try {
      const post = await PostModel.findById(postId);
      // if (post.likes.includes(userId)) {
      //   await post.updateOne({ $pull: { likes: userId } });
      //   res.status(200).json("Post disliked");
      // } else {
         await post.updateOne({ $push: { likes: userId } },{ new: true });
         const temppost = await post.save();
         console.log(temppost)
         console.log("like")
         res.status(200).json({temppost});
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
      const post = await PostModel.findById(postId);
        await post.updateOne({ $pull: { likes: userId } },{ new: true });
        const temppost = await post.save();
        res.status(200).json({temppost});
        console.log(temppost)
        console.log("unlike")
        // .then((response)=>{
        //   res.status(200).json({  message: response  });
        // })
        // .catch((err)=>{
        //   res.status(200).json({  message: err  });
        // });
      // }
    } catch (error) {
      res.status(500).json(error);
    }
  };


  module.exports = {getPosts,createPost,deletePost,addComment,likePost,unlikePost}