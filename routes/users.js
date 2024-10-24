const express = require("express");
const router = express.Router();
const error = require("../utilities/error.js");

const users = require("../data/users.js");
const posts = require("../data/posts.js");
const comments = require("../data/comments.js");

//////////////USERS//////////////
// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/", (req, res) => {
  res.json(users);
});

// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) res.json(user);
  else next();
});

// Retrieves comments made by the user with the specified id.
router.get("/:id/comments", (req, res, next) => {
  if (req.query.postId) {
    const postComments = comments.filter((comment) => {
      if (
        comment.userId == req.params.id &&
        comment.postId == req.query.postId
      ) {
        return comment;
      }
    });

    if (postComments.length > 0) {
      res.json(postComments);
    } else {
      next();
    }
  } else {
    const userComments = comments.filter((c) => {
      if (c.userId == req.params.id) {
        return c;
      }
    });

    if (userComments.length > 0) {
      res.json(userComments);
    } else {
      next();
    }
  }
});

// Create User
router.post("/", (req, res, next) => {
  // Within the POST request route, we create a new
  // user with the data given by the client.
  // We should also do some more robust validation here,
  // but this is just an example for now.
  if (req.body.name && req.body.username && req.body.email) {
    const foundUser = users.find((u) => u.username === req.body.username);
    if (foundUser) {
      return next(error(400, "Username Already Taken"));
    }

    const user = {
      id: users[users.length - 1].id + 1,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
    };

    users.push(user);
    res.json(user);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

// Update a user
router.patch("/:id", (req, res, next) => {
  // Within the patch request route, we allow the client to make changes to an existing user in the database
  const user = users.find((u, index) => {
    if (u.id == req.params.id) {
      //req.body holds the update for the user
      for (const key in req.body) {
        // applying the req.body keys to the existing user keys, overwriting them
        users[index][key] = req.body[key];
      }

      // returns the updated user, otherwise it would just return a boolean
      return true;
    }
  });

  if (user) res.json(user);
  else next();
});

// Delete a user
router.delete("/:id", (req, res, next) => {
  // const user = users.find((u, i) => {
  //   if (u.id == req.params.id) {
  //     users.splice(i, 1)
  //   }
  // })

  const userIndex = users.findIndex((u) => u.id == req.params.id);

  if (userIndex > -1) {
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    res.json(deletedUser);
  } else {
    next();
  }
});

//View Posts by User id param
router.get("/:id/posts", (req, res, next) => {
  const userPosts = posts.filter((post) => {
    if (post.userId == req.params.id) {
      return post;
    }
  });

  if (userPosts.length > 0) {
    res.send(userPosts);
  } else {
    next();
  }
});

module.exports = router;
