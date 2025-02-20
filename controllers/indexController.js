const db = require("../db/queries");

module.exports = async function indexController(req, res) {
  messages = await db.getAllMessagesWithUserInfo();
  res.render("index", { messages: messages });
};
