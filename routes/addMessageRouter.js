const { Router } = require("express");
const addMessageRouter = Router();
const db = require("../db/queries");

addMessageRouter.get("/", (req, res) => {
  res.render("addMessage")
});

addMessageRouter.post("/", (req, res) => {
  if (res.locals.currentUser) {
    if (req.body.title && req.body.text) {
      db.addMessage(res.locals.currentUser.username, Date.now(), req.body.title, req.body.text);
    }
  }
  res.redirect("/");
});

module.exports = addMessageRouter;
