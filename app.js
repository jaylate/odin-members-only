const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

const pool = require("./db/pool");
const addMessageRouter = require("./routes/addMessageRouter");
const editMessageRouter = require("./routes/editMessageRouter");
const deleteMessageRouter = require("./routes/deleteMessageRouter");
const secretRouter = require("./routes/secretRouter");
const signupRouter = require("./routes/signupRouter");
const indexController = require("./controllers/indexController");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.failureMessage = req.session.messages;
  res.locals.currentUser = req.user;
  req.session.messages = undefined; // FIXME: clearing the failure queue
  next();
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true
  })
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use("/secret", secretRouter);
app.use("/new", addMessageRouter);
app.use("/edit", editMessageRouter);
app.use("/delete", deleteMessageRouter);
app.use("/signup", signupRouter);
app.get("/", indexController);

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log("Listening on: "+PORT);
});
