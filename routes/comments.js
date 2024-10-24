const express = require("express");
const router = express.Router();
const error = require("../utilities/error.js");

const comments = require("../data/comments.js");
const users = require("../data/users.js");
const posts = require("../data/posts.js");

// Get all Comments
router.get("/", (req, res, next) => {
  // Retrieves comments by the user with the specified userId.
  if (req.query.userId) {
    const userComments = comments.filter((comment) => {
      if (comment.userId == req.query.userId) {
        return comment;
      }
    });

    if (userComments.length > 0) {
      res.send(userComments);
    } else {
      next();
    }
  } else if (req.query.postId) {
    // Retrieves comments made on the post with the specified postId.
    const postComments = comments.filter((comment) => {
      if (comment.postId == req.query.postId) {
        return comment;
      }
    });

    if (postComments.length > 0) {
      res.send(postComments);
    } else {
      next();
    }
  } else {
    res.json(comments);
  }
});

router.get("/:id", (req, res, next) => {
  const comment = comments.find((c) => c.id == req.params.id);

  if (comment) {
    res.send(comment);
  } else {
    next();
  }
});

// Create a Comment
router.post("/", (req, res) => {
  if (req.body.userId && req.body.postId && req.body.body) {
    const comment = {
      id: comments[comments.length - 1].id + 1,
      userId: req.body.userId,
      postId: req.body.postId,
      body: req.body.body,
    };

    comments.push(comment);
    res.json(comment);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

// Update a Comment
router.patch("/:id", (req, res, next) => {
  // Within the patch request route, we allow the client to make changes to an existing user in the database
  const comment = comments.find((c, index) => {
    if (c.id == req.params.id) {
      //req.body holds the update for the user
      for (const key in req.body) {
        // applying the req.body keys to the existing user keys, overwriting them
        comments[index][key] = req.body[key];
      }

      // returns the updated user, otherwise it would just return a boolean
      return true;
    }
  });

  if (comment) res.json(comment);
  else next();
});

// Delete a Comment
router.delete("/:id", (req, res, next) => {
  const comment = comments.find((c, i) => {
    if (c.id == req.params.id) {
      comments.splice(i, 1);
      return true;
    }
  });

  if (comment) res.json(comment);
  else next();
});

module.exports = router;
