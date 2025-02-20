const { Router } = require("express");
const deleteMessageRouter = Router();
const db = require("../db/queries");

deleteMessageRouter.get("/:msgid", (req, res) => {
  Promise.all([db.getMessageById(req.params.msgid)]).then((message) => {
    if (message[0] && res.locals.currentUser &&
	(res.locals.currentUser.username === message[0].creator
				|| res.locals.currentUser.isadmin)) {
      db.deleteMessage(req.params.msgid);
    }
  });
  res.redirect("/");
});

module.exports = deleteMessageRouter;
