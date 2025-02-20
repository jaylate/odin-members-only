#! /usr/bin/env node

require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fullname VARCHAR ( 255 ),
  username VARCHAR ( 255 ),
  password VARCHAR ( 255 ),
  isMember BOOLEAN,
  isAdmin BOOLEAN
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR ( 355 ),
  creatorId INTEGER,
  creationTime timestamp,
  text VARCHAR ( 1000 )
);`;

async function main() {
    console.log("Populating the database...");
    const client = new Client({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
    });
    
    await client.connect();
    await client.query(SQL);

    const { rows } = await client.query("SELECT * FROM users WHERE username = $1", [process.env.ADMIN_USERNAME]);
    
    if (rows.length > 0) {
	console.log("User with the username already exists. Not creating");
    } else {
	const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
	await client.query(
	    `INSERT INTO users (fullname, username, password, isMember, isAdmin) 
             VALUES
             ($1, $2, $3, true, true)`,
	    [
		process.env.ADMIN_FULLNAME,
		process.env.ADMIN_USERNAME,
		hashedAdminPassword
	    ]);
    }
    await client.end();
    console.log("done");
}

main();
