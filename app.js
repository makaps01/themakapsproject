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
const res = require('express/lib/response');
const { rmSync, stat } = require('fs');
const MySQLStore = require('express-mysql-session')(session);
const {
    user_isLoggedIn,
    role_client
} = require("./js/middleware");

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

// save session log 

var sessionOptions ={
    host: process.env.mysql_host,
    port: process.env.mysql_port,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_dbname,
}
var sessionStore = new MySQLStore(sessionOptions);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
/////////////////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
// login page 
app.get('/login', (req, res)=>{
    res.render("login");
});
// POST REQUEST FOR LOGIN
app.post('/login', (req, res)=>{   
    var {school_id, email, p_word} = req.body;
    pool.query("SELECT * FROM tbl_sti_register WHERE email=?", [email], (err, result)=>{
        if(err) throw err;
        console.log(result)
        if(result.length==0){
            console.log("user doesn't exist...")
            res.redirect("/login");
        }else{
            if(p_word==result[0].p_word){
                req.session.user_isLoggedIn = true;
                req.session.school_id = result[0].school_id;
                req.session.email = result[0].email;
                req.session.role = result[0].role;
                req.session.campus = result[0].campus;
                req.session.birthday = result[0].birthday;
                console.log("LOGIN SET TO: "+ req.session.user_isLoggedIn)
                console.log("USER :"+ req.session.full_name)
                console.log("EMAIL: "+ req.session.email)
                console.log("BIRTHDAY: "+ req.session.birthday)
                console.log("ROLE: "+ req.session.role)
                console.log("Mission failed successfully!")
                res.render("fill-up", {
                    regform: result
                });
            }else{
                console.log("wrong password")
                res.redirect("/login");
            }
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
// get request for fill up
app.get('/fill-up', (req, res)=>{
    res.render("fill-up");
});

// post request for new documents
app.post('/fill-up', (req, res)=>{
var {doc_type, school_id, grad_year, full_name, email} = req.body;
var date= new Date();
var status= 'pending';
const sql = `INSERT INTO tbl_sti_documents set ?`;

let document={
    doc_type: doc_type,
    school_id: school_id,
    grad_year: grad_year,
    full_name: full_name,
    email: email,
    date: date,
    status: status
}
pool.query(sql, document,(err, result)=>{
    if(err) throw err;
    console.log(result)
    res.render("view", {
        docs: result
    });
});
});
// get request to view documents
app.get('/view-documents', (req, res)=>{
    res.render("view");
});
app.post('/select-document', (req, result)=>{
    pool.query("SELECT * FROM tbl_sti_documents WHERE school_id=?",[school_id],(req, result)=>{
        if(err) throw err;
        console.log(result)
        res.render("view",{
            docs: result
        });
    });
});

// register-user page
app.get('/register', (req, res)=> {
    res.render("register");
});
// POST REQUEST FOR REGISTRATION
app.post('/register', (req, res)=>{
    var {school_id, grad_year, full_name, email, birthday, p_word, campus} = req.body;
    var role = 'student';
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
                    campus: campus,
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

// student list - get and post request
app.get('/students', (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_students",(err, student)=>{
        if(err) throw err;
        res.render("student-list",{
            student,
        });
    });
});
app.post('/students/add-new',(req, res)=>{
    var {last_name, first_name, middle, month, day, year, course, y_admitted, status} = req.body;
    var full_name = first_name + " " + middle + "  " + last_name;
    var birthday = month + "" + day + "" + year;

    const sql = `INSERT INTO tbl_sti_students set ?`;
    let new_student={
        full_name: full_name,
        birthday: birthday,
        course: course,
        y_admitted: y_admitted,
        status: status
    }
    pool.query(sql, new_student,(err, student)=>{
        if(err) throw err;
        res.redirect("/students")
    });
});
// session log get request
app.get('/audit-log',(req, res)=>{
    res.render("session");
});

// acocunts of user get request
app.get('/accounts', (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_register",(err, accounts)=>{
        if(err) throw err;
        res.render("accounts",{
            accounts,
        });
    });
});


// check pending documents
app.get('/pending', (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_documents",(err, pending)=>{
        if(err) throw err;
        res.render("pending",{
            pending,
        });
    });
});

//check completed documents
app.get('/completed',(req, res)=>{
    pool.query("SELECT * FROM tbl_sti_documents",(err, complete)=>{
        if(err) throw err;
        res.render("completed",{
            complete,
        });
    });
});


// log out 
app.get('/log-out', (req, res)=>{
    res.render("login");
});