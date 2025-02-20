const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const pool = require("../db/pool");
const signupRouter = Router();

signupRouter.get("/", (req, res) => res.render("signup", { errors: undefined }));
signupRouter.post("/",
	 [
	   check('passwordConfirmation').custom((value, { req }) => {
	     return value === req.body.password;
	   }).withMessage("Passwords do not match"),
	   check('username').custom(async (value, { req }) => {
	     const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [value]);
	     if (rows.length > 0) {
	       return Promise.reject();
	     }
	   }).withMessage("Username already exists"),
	   async (req, res, next) => {
	     const errors = await validationResult(req);
	     if (!errors.isEmpty()) {
	       return res.status(400).render("signup", { errors: errors.array() });
	     }
	     next();
	   }
	 ],
	 async (req, res, next) => {
	   try {	     
	     const hashedPassword = await bcrypt.hash(req.body.password, 12);

	     await pool.query(
	       `INSERT INTO users (fullname, username, password, ismember, isadmin)
                VALUES ($1, $2, $3, false, false)`, [
		  req.body.fullname,
		  req.body.username,
		  hashedPassword
	     ]);
	     res.redirect("/");
	   } catch (err) {
	     return next(err);
	   }
	 }
);

module.exports = signupRouter;
