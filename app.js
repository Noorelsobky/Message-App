const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("./passportconfig");
require("dotenv").config();
const authRouter = require("./routes/authRouter");
const messageRouter = require("./routes/messageRouter");
const userRouter = require("./routes/userRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRouter);
app.use("/", messageRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.redirect("/log-in");
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send("Something went wrong. Please try again.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});