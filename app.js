/////////////////// DEPENDENCIES
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const  { rmSync } = require('fs');
const { request } = require('http');
const e= require('express');
const MySQLStore  = require('express-mysql-session')(session);
const session = require('express-session');
/////////////////////// CONFIGURATIONS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/views"));
app.set("public", path.join(__dirname + "/public"));
PORT = 4000;
app.listen(PORT);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var pool = mysql2.createPool({
    host: process.env.mysql_host,
    port: process.env.mysql_port,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    dataase: process.env.mysql_dbname,
    multipleStatements: true,
    timezone: "+00:00",
});

/////////////////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
// index route
app.get('/',(req, res)=>{
    res.render("index")
});

// login- find in database


//route to client page
app.get('/client-portal', (req, res)=> {
    res.render("client")
});
// route to server page
app.get('/server-portal',(req, res)=> {
    res.render("server")
} );    

// registration form
app.get('/register', (req, res)=> {
    res.render("register")
});


//registration post request form
app.post('/register',(req, res)=>{    
    var {sy, contact_no, course } = req.body;

    let reg = {
        fname: fname,
        lname: lname,
        sy: sy,
        contact_no: contact_no,
        course: course
    }

    pool.getConnection((err, con)=> {
        if(err) throw err;
        con.query(sql, reg, (err, result)=>{
            if(err) throw err;
            res.redirect("/register")
        });
    });
});