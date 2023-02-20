/////////////////// DEPENDENCIES
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const  { rmSync } = require('fs');
const { request } = require('http');
const e= require('express');
const MySQLStore  = require('express-mysql-session');
const session = require('express-session');
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
app.get('login', (req, res)=>{
    res.render("login");
});