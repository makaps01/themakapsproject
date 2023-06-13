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
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const fileUpload = require("express-fileupload");

const {
    user_isLoggedIn,
    role_client,
    user_isAdmin
} = require("./js/middleware");

dotenv.config({path:"config.env"})
app.set("view engine", "ejs");
/////////////////////// CONFIGURATIONS
// SET FOLDER FILES WHERE EJS IS STORED
app.set("views", path.join(__dirname, "views"));
// STATIC FOLDER || LOADS ALL ASSETS FROM PUBLIC FOLDER
app.use(express.static(__dirname + "/public"));

// ACCESING PORT AND SQLPOOL
PORT = 3000;
app.listen(PORT);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(fileUpload());
app.use(express.urlencoded({extended: false}))
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
    const userRole = req.session.role;
    var {email, p_word} = req.body;
    pool.query("SELECT * FROM tbl_sti_register WHERE email=?", [email], (err, result)=>{
        if(err) throw err;
        console.log(result)

        if(result.length==0){
            console.log("user doesn't exist...")
            res.redirect("/login")
        }else{
                if(p_word==result[0].p_word){
                    req.session.user_isLoggedIn = true;
                    req.session.m_number = result[0].m_number;
                    req.session.email = result[0].email;
                    req.session.role = result[0].role;
                    req.session.campus = result[0].campus;
                    req.session.birthday = result[0].birthday;
                    console.log("LOGIN SET TO: "+ req.session.user_isLoggedIn)
                    console.log("EMAIL: "+ req.session.email)
                    console.log("BIRTHDAY: "+ req.session.birthday)
                    console.log("ROLE: "+ req.session.role)
                    console.log("Login successfully!")
                    res.redirect("/fill-up") 
                }else{
                    console.log("Wrong Email or Password...")
                    res.redirect("/login");
                }
            }
        
    });
});  
// forgot password page
app.get('/forgot-password', (req, res)=>{
    res.render("forgot-password");
});
 
app.post('/forgot-password', (req, res)=>{
   const {email} = req.body;
   // find user in the database
   pool.query("SELECT * FROM tbl_sti_register WHERE email=?", [email],(err, result)=>{
    if(err) throw err;
    console.log(result)
    if(result.length==0){
        console.log("user doesn't exist...")
        return;
    }else{
        const secret = JWT_SECRET + result.password
        const payload = {
            email: email,
        }
    }
   });
});
///////////////////admin dashboard // //////////////////////////
app.get('/dashboard',user_isAdmin(), (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_register;",(err, result)=>{
    if(err) throw err;
    pool.query("SELECT * FROM tbl_sti_documents;SELECT COUNT(*) as v1 FROM tbl_sti_documents",(err, access)=>{
      if(err) throw err;
        pool.query(`SELECT * FROM tbl_sti_documents WHERE status="pending"; SELECT COUNT(*) as v2 FROM tbl_sti_documents WHERE status="pending"`,(err, pending)=>{
            if(err) throw err;
            pool.query(`SELECT * FROM tbl_sti_documents WHERE status="completed"; SELECT COUNT(*) as v3 FROM tbl_sti_documents WHERE status="completed"`, (err, complete)=>{
                if(err) throw err;
                pool.query(`SELECT COUNT(*) as v4 FROM tbl_sti_register;`, (err, ttl_users)=>{
                    if(err) throw err;
                    res.render("index", {
                        access: access[0], total_doc: access[1][0].v1,
                        pending: pending[0], pending_count: pending[1][0].v2,
                        complete: complete[0], complete_count: complete[1][0].v3,
                        ttl_users : ttl_users[0].v4
                    });

                })
            })
            })
        })
    })  
})
////////////////////////// CLIENT DASHBOARD //////////////////////
// get request for fill up
app.get('/fill-up',role_client(), (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_register WHERE email=?", [req.session.email], (err, result)=>{
        if (err) throw err;
        res.render("fill-up",{
            regform : result
        });
    });
});
// post request for new documents
app.post('/fill-up', (req, res)=>{
    var {doc_type, m_number, y_admitted, full_name, email} = req.body;
    var date = new Date();
    var serial_no = 'A#######';
    var remarks = 'No remarks';
    var status= 'pending';
    const sql = `INSERT INTO tbl_sti_documents set ?`;

    let document={
        doc_type: doc_type,
        serial_no: serial_no,
        m_number: m_number,
        y_admitted: y_admitted,
        full_name: full_name,
        email: email,
        date: date,
        status: status,
        remarks: remarks
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
    pool.query("SELECT * FROM tbl_sti_documents WHERE full_name=?",[full_name],(req, docs)=>{
       if(err) throw err;
       console.log(docs)
       res.render("view",{
        docs
       });
    });
});

// register-user page
app.get('/register', (req, res)=> {
    res.render("register");
});

// POST REQUEST FOR REGISTRATION
app.post('/register', (req, res)=>{
    var {m_number, y_admitted, full_name, email, birthday, p_word, campus} = req.body;
    var role = 'student';
    pool.query("SELECT * FROM tbl_sti_register WHERE email=?",[email],(err, result)=>{
        if(err) throw err;

        if(email==result[0].email){
            console.log("Email already taken...")
            res.redirect("/register")
        }
        
        else{
            if(result.length==0){
                const sql = `INSERT INTO tbl_sti_register set ?`;
                let sti_register = {
                    m_number: m_number,
                    y_admitted: y_admitted,
                    full_name: full_name,
                    email: email,
                    birthday: birthday,
                    p_word: p_word,
                    campus: campus,
                    role: role
                }
                pool.query(sql, sti_register,(err, result)=>{
                    if(err) throw err;
                    console.log(result)
                    res.redirect("/login")
                });
            }
        }
    });

});
// student list - get and post request
app.get('/students', (req, res)=>{
    pool.query("SELECT * FROM sti_students",(err, students)=>{
        if(err) throw err;
        res.render("student-list",{
            students,
        });
    });
});
app.post('/students/add-new',(req, res)=>{
    var{f_name, course, form137, form138, birth_certificate, ojt_report, grading_sheet, school_year} = req.body;
    pool.query("SELECT * FROM sti_students WHERE f_name=?",[f_name],(err, result)=>{
        if(err) throw err;

        if(f_name==result[0].f_name){
            console.log("Student name already exists...")
            res.redirect("/students")
        }
        else{
            if(result.length== 0){
                const sql = `INSERT INTO sti_students set ?`;

                let new_student = {
                    f_name: f_name,
                    course: course,
                    form137: form137,
                    form138: form138,
                    birth_certificate: birth_certificate,
                    ojt_report: ojt_report,
                    grading_sheet: grading_sheet,
                    school_year: school_year
                }

                pool.query(sql, new_student,(err, result)=>{
                    if(err) throw err;
                    res.redirect('/students')
                });
            }
        }
    });
});
// session log get request
app.get('/session-log', (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_documents WHERE status='pending'",(err, walkin)=>{
        if(err) throw err;
        res.render("session",{
            walkin,
        });
    });
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

// add new account in database - 
// logIN ACCOUNT TO BE SPECIFIC
app.post('/accounts/add-account',(req,res)=>{
    var{m_number, y_admitted, full_name, email, birthday, p_word, campus} = req.body;
    var role= 'student';
    const sql = `INSERT INTO tbl_sti_register set ?`;
    let new_account ={
        m_number: m_number,
        y_admitted: y_admitted,
        full_name: full_name,
        email: email,
        birthday: birthday,
        p_word: p_word,
        campus: campus,
        role: role
    }
    pool.query(sql, new_account,(err, result)=>{
        if(err) throw err;
        console.log(result)
        res.redirect("/accounts")
    });
});

// these are the routes to check pending documents/ completed documents
// check pending documents
app.get('/pending', (req, res)=>{
    pool.query("SELECT * FROM tbl_sti_documents WHERE status='pending'",(err, pending)=>{
        if(err) throw err;
        res.render("pending",{
            pending,
        });
    });
});

//check completed documents
app.get('/completed',(req, res)=>{
    pool.query("SELECT * FROM tbl_sti_documents WHERE status='completed'",(err, complete)=>{
        if(err) throw err;
        res.render("completed",{
            complete,
        });
    });
});

// re-route to specific id of document
app.get('/pending/edit/:transactionID', (req, res)=>{
    transaction_id = req.params.transaction_id;
    pool.query("SELECT * FROM tbl_sti_documents where transaction_no=?",[transaction_id],(err, data)=>{
    if(err) throw err;
    res.render("update-docs",{
         data
        });
    });
});

// post request to update documents
app.post('/pending/update', (req, res)=>{
    var {serial_no, status, remarks} = req.body;
    pool.query(`UPDATE tbl_sti_documents SET serial_no=?, status=?, remarks=?;`,[serial_no, status, remarks],(err, result)=>{
        if(err) throw err;
            console.log(result)
                res.redirect("/pending")
            });
        });

// LOG OUT MODAL
// log out
app.get('/log-out', (req, res)=>{
    req.session.destroy();
    res.redirect("login");
});

// post request to add new transaction for walk-in applicants
app.post('/session/add-transaction', (req, res)=>{
   var{doc_type, m_number, y_admitted, full_name, email}= req.body;
   var date= new Date();
   var serial_no = 'A#######';
    var remarks = 'No remarks';
    var status= 'pending'; 
   const sql = `INSERT INTO tbl_sti_documents set ?`;
    let new_transaction = {
        doc_type: doc_type,
        serial_no: serial_no,
        m_number: m_number,
        y_admitted: y_admitted,
        full_name: full_name,
        email: email,
        date: date,
        status: status,
        remarks: remarks
    }

    pool.query(sql, new_transaction,(err, result)=>{
        if(err) throw err;
        console.log(result)
        res.redirect("/session-log")
    });
});
