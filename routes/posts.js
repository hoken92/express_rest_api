const express = require("express");
const router = express.Router();
const error = require("../utilities/error.js");

const users = require("../data/users.js");
const posts = require("../data/posts.js");
const comments = require("../data/comments.js");

router.get("/", (req, res, next) => {
  if (req.query.userId) {
    const userPosts = posts.filter((post) => {
      if (post.userId == req.query.userId) {
        return post;
      }
    });

    if (userPosts.length > 0) {
      res.send(userPosts);
    } else {
      next();
    }
  } else {
    res.json(posts);
  }
});

router.get("/:id", (req, res, next) => {
  const post = posts.find((p) => p.id == req.params.id);
  if (post) res.json(post);
  else next();
});

router.get("/:id/comments", (req, res, next) => {
  if (req.query.userId) {
    // Retrieves all comments made on the post with the specified id by a user with the specified userId.
    const userComments = comments.filter((comment) => {
      if (
        comment.userId == req.query.userId &&
        comment.postId == req.params.id
      ) {
        return comment;
      }
    });

    if (userComments.length > 0) {
      res.json(userComments);
    } else {
      next();
    }
  } else {
    // Retrieves comments made by the post with the specified id.
    const postComments = comments.filter((c) => {
      if (c.postId == req.params.id) {
        return c;
      }
    });

    if (postComments.length > 0) {
      res.json(postComments);
    } else {
      next();
    }
  }
});

// Create Post
router.post("/", (req, res, next) => {
  // Within the POST request route, we create a new
  // user with the data given by the client.
  // We should also do some more robust validation here,
  // but this is just an example for now.
  if (req.body.userId && req.body.title && req.body.content) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      userId: req.body.userId,
      title: req.body.title,
      content: req.body.content,
    };

    posts.push(post);
    res.json(post);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

// Update a Post
router.patch("/:id", (req, res, next) => {
  // Within the patch request route, we allow the client to make changes to an existing user in the database
  const post = posts.find((p, index) => {
    if (p.id == req.params.id) {
      //req.body holds the update for the user
      for (const key in req.body) {
        // applying the req.body keys to the existing user keys, overwriting them
        posts[index][key] = req.body[key];
      }

      // returns the updated user, otherwise it would just return a boolean
      return true;
    }
  });

  if (post) res.json(post);
  else next();
});

// Delete a Post
router.delete("/:id", (req, res, next) => {
  const post = posts.find((p, i) => {
    if (p.id == req.params.id) {
      posts.splice(i, 1);
      return true;
    }
  });

  if (post) res.json(post);
  else next();
});

module.exports = router;
