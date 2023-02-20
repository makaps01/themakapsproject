/////////////////// DEPENDENCIES
var dotenv = require('dotenv');
const express = require("express");
const path = require("path");
const app = express();
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');
const text = require('body-parser/lib/types/text');
const { connected } = require('process');
const session = require('express-session');
const { rmSync } = require('fs');
const { request } = require('express');
const e = require('express');
const { reset } = require('nodemon');
const mySQLStore = require('express-mysql-session')(session);

dotenv.config({path:"config.env"})
app.set("view engine", "ejs");
/////////////////////// CONFIGURATIONS
// SET FOLDER FILES WHERE EJS IS STORED
app.set("views", path.join(__dirname, "views"));
// STATIC FOLDER || LOADS ALL ASSETS FROM PUBLIC FOLDER
app.use(express.static(__dirname + "/public"));


PORT = 4000;
app.listen(PORT);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/*
var pool = mysql2.createPool({
    host: process.env.mysql_host,
    port: process.env.mysql_port,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    dataase: process.env.mysql_dbname,
    multipleStatements: true,
    timezone: "+00:00",
});
*/
/////////////////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
// login page 
app.get('/login', (req, res)=>{
    res.render("login");
});

// register-user page
app.get('/register', (req, res)=> {
    res.render("register");
});

// forgot password page
app.get('/forgot-password', (req, res)=>{
    res.render("forgot-password");
});

// /////////////////admin dashboard // //////////////////////////
app.get('/dashboard', (req, res)=>{
    res.render("index");
});