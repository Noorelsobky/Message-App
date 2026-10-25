const bcrypt = require("bcrypt");
const prisma = require("../db");
const passport = require("../passportconfig");


const getSignUp = (req, res) => {
  res.render("sign-up");
};

const postSignUp = async (req, res, next) => {
  try {
    const username = req.body.username.trim();
    const password = req.body.password;

    if (!username || username.trim() === "") {
      return res.status(400).render("sign-up", {
        error: "Username is required.",
      });
    }
    
    if (!password || password.length < 8) {
      return res.status(400).render("sign-up", {
        error: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return res.status(400).render("sign-up", {
        error: "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.redirect("/log-in");
  } catch (error) {
    next(error);
  }
};

const getLogIn = (req, res) => {
  res.render("log-in");
};

const postLogIn = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).render("log-in", {
        error: info.message,
      });
    }

    req.login(user, (error) => {
      if (error) {
        return next(error);
      }

      res.redirect("/messages");
    });
  })(req, res, next);
};

const logOut = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    res.redirect("/log-in");
  });
};

module.exports = {
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  logOut,
};