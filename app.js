/////////////////// DEPENDENCIES
var dotenv = require('dotenv');
const express = require("express");
const path = require("path");
const app = express();
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');
const text = require('body-parser/lib/types/text');
const { connected, emit } = require('process');
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

var pool = mysql2.createPool({
    host: process.env.mysql_host,
    port: process.env.mysql_port,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_dbname,
    multipleStatements: true,
    timezone: "+00:00",
});

/////////////////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
// login page 
app.get('/login', (req, res)=>{
    res.render("login");
});

// register-user page
app.get('/register', (req, res)=> {
    res.render("register");
});
// POST REQUEST FOR REGISTRATION
app.post('/register', (req, res)=>{
    var {school_id, grad_year, full_name, email, birthday, p_word, role} = req.body;
    pool.query("SELECT * FROM tbl_sti_register WHERE email=?",[email],(err, result)=>{
        if(err) throw err;
            if(result.length == 0) {
                const sql = `INSERT INTO tbl_sti_register set ?`;
                let sti_register ={
                    school_id: school_id,
                    grad_year: grad_year,
                    full_name: full_name,
                    email: email,
                    birthday: birthday,
                    p_word: p_word,
                    role: role
                }
                pool.query(sql, sti_register,(err, result)=>{
                    if(err) throw err;
                    res.redirect("/login")
                });
            }else{
                console.log("user already exist")
                res.redirect("/register")
            }
    });

});

// forgot password page
app.get('/forgot-password', (req, res)=>{
    res.render("forgot-password");
});

///////////////////admin dashboard // //////////////////////////
app.get('/dashboard', (req, res)=>{
    res.render("index");
});






////////////////////////// CLIENT DASHBOARD //////////////////////
app.get('/client-dashboard', (req, res)=>{
    res.render("client");
});