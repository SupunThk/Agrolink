const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");

router.use(requireDb);

// ── ADMIN: Get all posts for moderation ─────────────────────────────────────
router.get("/admin/all", async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    // Attach author info (profile pic, name) from User collection
    const usernames = [...new Set(posts.map((p) => p.username))];
    const users = await User.find({ username: { $in: usernames } }).select(
      "username name profilePic",
    );
    const userMap = {};
    users.forEach((u) => {
      userMap[u.username] = u;
    });

    const enriched = posts.map((p) => {
      const post = p._doc;
      const author = userMap[post.username];
      return {
        ...post,
        authorName: author?.name || post.username,
        authorPic: author?.profilePic || "",
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error("[GET /posts/admin/all]", err);
    res.status(500).json("Something went wrong!");
  }
});

// ── ADMIN: Get moderation stats ─────────────────────────────────────────────
router.get("/admin/mod-stats", async (req, res) => {
  try {
    const [total, pending, approved, rejected, flagged] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "Pending" }),
      Post.countDocuments({ status: "Approved" }),
      Post.countDocuments({ status: "Rejected" }),
      Post.countDocuments({ flagged: true }),
    ]);
    res.status(200).json({ total, pending, approved, rejected, flagged });
  } catch (err) {
    res.status(500).json("Something went wrong!");
  }
});

// ── ADMIN: Approve a post ───────────────────────────────────────────────────
router.put("/admin/approve/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found!");
    post.status = "Approved";
    post.rejectionReason = "";
    post.flagged = false;
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json("Something went wrong!");
  }
});

// ── ADMIN: Reject a post ───────────────────────────────────────────────────
router.put("/admin/reject/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found!");
    post.status = "Rejected";
    post.rejectionReason = req.body.reason || "";
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json("Something went wrong!");
  }
});

// ── ADMIN: Flag / Unflag a post ─────────────────────────────────────────────
router.put("/admin/flag/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found!");
    post.flagged = !post.flagged;
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json("Something went wrong!");
  }
});

// ── ADMIN: Delete any post ──────────────────────────────────────────────────
router.delete("/admin/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found!");
    await post.deleteOne();
    res.status(200).json("Post has been deleted.");
  } catch (err) {
    res.status(500).json("Something went wrong!");
  }
});

//CREATE POST
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE POST
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true },
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json("Post not found");

    // compare usernames safely
    if (
      post.username.trim().toLowerCase() ===
      req.body.username.trim().toLowerCase()
    ) {
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
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL POST
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error("GET /posts error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
