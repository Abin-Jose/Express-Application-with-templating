const express = require('express')
const app = express()

var db = require('./db');
var bodyParser = require("body-parser");
var path = require('path');
var validator = require("express-validator");

// declaring global variables

global.datas = null;
global.error = null;

//using express custom vvalidtor module
app.use(validator());

//sample custom middleware function

var checkMiddleware = function(req,res,next){
    // console.log("middleware function called");
    next();
}

//using sample custom middleware function
app.use(checkMiddleware);

//middleware for parsing the datas from forms and all
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//serving of static file contents for rendering
app.use('/basepath', express.static(path.join(__dirname, 'public')))

//defining template engine as ejs
app.set('views', './views') // specify the views directory
app.set('view engine', 'ejs') // register the template engine

/* Template rendering and submitting starts */

var getData = function(){
    db.query('SELECT * from user_details limit 6', function (err, rows, fields) {
        if (err) throw err
       return rows[0].username;
    }) 
}

app.get('/formview', function (req, res) {
    
    db.query('SELECT * from user_details', function (err, rows, fields) {
        if (err) throw err
        datas = rows;
        res.render('index',{title:"Welcome",errors:error,datas:datas})
    }) 
})

app.post('/formsubmit',function(req,res){
    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("username","username Cannot be empty").notEmpty();
    req.checkBody("firstname","firstname Cannot be empty").notEmpty();
    req.checkBody("pass","password Cannot be empty").notEmpty();
    var errors = req.validationErrors();
    if(errors){
        res.render('index',{
            title:"welcome",
            errors : errors,
            datas:datas
        })
    }
    else{
        saveForm(req);
        res.redirect('/formview');
    }
})

var saveForm = function(req){
    var sql = "insert into user_details (username,first_name,last_name,gender,password,status)values ?";
    var values = [[req.body.username,req.body.firstname,'ttest','test',req.body.pass,1]];
    db.query(sql,[values], function (err, rows, fields) {
        if (err) return err
        return "row insert sucessfully";
    })  
}

/* Template rendering and submitting ends */

app.get('/', function (req, res) {
    res.send("Got to /formview for viewing sample form ")
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})