require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const usersRouter = require("./routes/users.js");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const error = require("./utilities/error.js");
// converts blackslashes to foward slashes for different OS
const path = require("path");

// Middleware
// Allows us to read form data
app.use(express.urlencoded({ extended: true }));
// Allows us to read json data
app.use(express.json({ extended: true }));

app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

// API KEY Middleware
const apiKeys = process.env["API-KEYS"];

app.use("/api", (req, res, next) => {
  const key = req.query["api-key"];

  // Check for the absence of a key
  if (!key) {
    res.status(400).json({ error: "API Key Required" });
    return;
  }

  // Check for key validity
  if (apiKeys.indexOf(key) === -1) {
    res.status(401).json({ error: "Invalid API Key" });
    return;
  }

  req.key = key;
  next();
});

// Router Set up

// Users
// Make the api/users route static
app.use("/api/users", usersRouter);

//////////////POSTS//////////////
app.use("/api/posts", postsRouter);

//////////////COMMENTS//////////////
app.use("/api/comments", commentsRouter);

// New User Form
app.get("/users/new", (req, res) => {
  // only works for GET and POST request by default
  // If trying to send a PATCH, PUT, DELETE - Look into methodoverride package
  res.send(`
    <div>
      <h1>Create a user</h1>
      <form action="/api/users?api-key=perscholas" method="POST">
        Name: <input type="text" name="name" />
        <br />
        Username: <input type="text" name="username" />
        <br />
        Email: <input type="email" name="email" />
        <input type="submit" value="Create User" />
      </form>
    </div>
    `);
});

// Download Example
app.use(express.static("./data"));

app.get("/get-data", (req, res) => {
  res.send(`
    <div>
      <h1>Cat Images to Download</h1>
      <form action="/download/users.js">
        <button>Download Users Data</button>
      </form>

      <form action="/download/posts.js">
        <button>Download Posts Data</button>
      </form>
    </div>
    `);
});

app.get("/download/:filename", (req, res) => {
  res.download(path.join(__dirname, "data", req.params.filename));
});

app.get("/", (req, res) => {
  res.send("Work in progress!");
});

// 404 Error Handling Middleware
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"));
});

// Error-handling middleware.
// Any call to next() that includes an
// Error() will skip regular middleware and
// only be processed by error-handling middleware.
// This changes our error handling throughout the application,
// but allows us to change the processing of ALL errors
// at once in a single location, which is important for
// scalability and maintainability.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
