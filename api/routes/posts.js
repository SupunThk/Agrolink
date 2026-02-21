const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//CREATE POST
router.post("/", async(req, res) => {
   const newPost = new Post(req.body);
   try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
   }catch(err){
    res.status(500).json(err)
   }
});


//UPDATE POST
router.put("/:id", async(req, res) => {
   try{
        const post = await Post.findById(req.params.id);
        if(post.username === req.body.username){
            try{
                const updatedPost = await Post.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set:req.body
                    },
                    {new:true}
                );
                res.status(200).json(updatedPost);
            }catch(err){
               res.status(500).json(err);
            }

            } else{
                res.status(401).json("You can update only your post!")
            }
   }catch(err){
        res.status(500).json(err);
   }
});



//DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json("Post not found");

    // compare usernames safely
    if (post.username.trim().toLowerCase() === req.body.username.trim().toLowerCase()) {
      await post.deleteOne(); // correct delete
      return res.status(200).json("Post has been deleted...");
    } else {
      return res.status(401).json("You can delete only your post!");
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json("Server error");
  }
});



//GET POST
router.get("/:id", async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err)
    }
});


//GET ALL POST
router.get("/", async (req,res)=>{
    const username = req.query.user;
    const catName = req.query.cat;
    try{
        let posts;
        if(username){
            posts = await Post.find({username})
        } else if(catName){
            posts = await Post.find({
                categories:{
                    $in:[catName],
                },
            });
        } else{
            posts = await Post.find(); 
        }
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;

