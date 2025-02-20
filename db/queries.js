const pool = require("./pool");

async function getUsernameID(username) {
  const { rows } = await pool.query("SELECT id FROM users WHERE username = $1",
			      [username]);
  return rows[0];
}

async function getAllMessagesWithUserInfo() {
  const { rows } = await pool.query(
    `SELECT messages.id, title, text, creationtime,
            creatorid, fullname as creatorfullname, username as creatorusername,
            ismember as iscreatormember, isadmin as iscreatoradmin
     FROM messages JOIN users ON messages.creatorid = users.id
     ORDER BY messages.id DESC`);
  return rows;
}

async function addMessage(username, time, title, text) {
  const { rows } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  const userId = rows[0].id;
  await pool.query(
    `INSERT INTO messages (title, creatorid, creationtime, text)
     VALUES
     ($1, $2, to_timestamp($3), $4)`,
    [title, userId, time / 1000, text]);
}

async function updateMessage(msgid, title, text) {
  await pool.query(
    `UPDATE messages SET title = $2, text = $3 WHERE id = $1`,
    [msgid, title, text]);
}

async function deleteMessage(msgid) {
  await pool.query(
    `DELETE FROM messages WHERE id = $1`,
    [msgid]);
}

async function getMessageById(msgid) {
  const { rows } = await pool.query(
    `SELECT title, text, username as creator FROM messages
     JOIN users ON messages.creatorid = users.id WHERE messages.id = $1`, [msgid]);
  return rows[0];
}

async function makeUserMember(user) {
  // FIXME: Error check?
  await pool.query(`UPDATE users SET ismember = true WHERE id = $1`, [user.id]);
}

module.exports = {
  getUsernameID,
  getAllMessagesWithUserInfo,
  addMessage,
  updateMessage,
  deleteMessage,
  getMessageById,
  makeUserMember
};
