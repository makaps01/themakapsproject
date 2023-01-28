/////////////////// DEPENDENCIES
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const  { rmSync } = require('fs');
/////////////////////// CONFIGURATIONS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/public"));
PORT = 5000;
app.listen(PORT);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




/////////////////////////////////////////////////////////////////ROUTES///////////////////////////////////////////////
// client route
app.get("/login",(req, res)=>{
    res.render("index")
});