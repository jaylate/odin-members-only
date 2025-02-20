const { Router } = require("express");
const secretRouter = Router();
const db = require("../db/queries");

secretRouter.get("/", (req, res) => {
  res.render("secret", {hint: req.query.hint === ''}); // FIXME: I just need to check whether 'hint' exists in url
});

secretRouter.post("/", (req, res) => {
  if (res.locals.currentUser && !res.locals.currentUser.ismember) {
    if (req.body.secret === process.env.MEMBER_SECRET) {
      db.makeUserMember(res.locals.currentUser);
    } else {
      res.redirect("/secret?hint");
    }
  } else {
    res.redirect("/");
  }
});

module.exports = secretRouter;
