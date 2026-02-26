const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");


router.use(requireDb);

//CREATE POST
router.post("/", async(req, res) => {
   const newPost = new Post(req.body);
   try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
   }catch(err){
    res.status(500).json("Something went wrong!")
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
                    res.status(500).json("Something went wrong!");
            }

            } else{
                res.status(401).json("You can update only your post!")
            }
   }catch(err){
       res.status(500).json("Something went wrong!");
   }
});



//DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json("Post not found");

    // Compare usernames safely (case-insensitive, trimmed)
    if (post.username.trim().toLowerCase() !== req.body.username.trim().toLowerCase()) {
      return res.status(401).json("You can delete only your post!");
    }


    await post.deleteOne();
    return res.status(200).json("Post has been deleted...");

  } catch (err) {
    console.error("[DELETE /posts/:id]", err);
    return res.status(500).json("Server error");
  }
});



//GET POST
router.get("/:id", async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json("Something went wrong!")
    }
});


//GET ALL POST
router.get("/", async (req,res)=>{
    const username = req.query.user;
    const catName = req.query.cat;

    const DEFAULT_CATEGORIES = [
        "Organic Farming",
        "Inorganic Farming",
        "Crop Diseases",
        "Pest Management",
        "Soil Management",
        "Weather & Climate",
        "Crop Growth",
        "Fertilizer Management",
    ];

    try{
        let posts;
        if(username){
            posts = await Post.find({username}).sort({ createdAt: -1 });
        } else if(catName){
            if (catName === "Other") {
                posts = await Post.find({
                    categories: {
                        $elemMatch: { $nin: DEFAULT_CATEGORIES },
                    },
                }).sort({ createdAt: -1 });
            } else {
                posts = await Post.find({
                    categories:{
                        $in:[catName],
                    },
                }).sort({ createdAt: -1 });
            }
        } else{
            posts = await Post.find().sort({ createdAt: -1 });
        }
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json("Something went wrong!");
    }
});

module.exports = router;

