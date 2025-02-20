const { Router } = require("express");
const editMessageRouter = Router();
const db = require("../db/queries");

editMessageRouter.get("/:msgid", (req, res) => {
  Promise.all([db.getMessageById(req.params.msgid)]).then((message) => {
    res.render("editMessage", {msgid: req.params.msgid, message: message[0]}); // FIXME: should this really know id?
  });
});

editMessageRouter.post("/:msgid", (req, res) => {
  Promise.all([db.getMessageById(req.params.msgid)]).then((message) => {
    if (res.locals.currentUser && (res.locals.currentUser.username === message[0].creator || res.locals.currentUser.isadmin)) {
      if (req.body.title && req.body.text) {
	db.updateMessage(req.params.msgid, req.body.title, req.body.text);
      }
    }
  });
  res.redirect("/");
});

module.exports = editMessageRouter;
