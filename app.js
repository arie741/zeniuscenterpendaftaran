const express = require('express')
//Body parser
const bodyParser = require('body-parser');
//Express session
const ExpressSessions = require('express-session'); 
//Express validator for validating in login process 
const expressValidator = require('express-validator');
const fs= require('fs');
//Database
const db = require('./db');
//Encryption
const enc = require('./encrypt');
//Uuid
const uuidv1 = require('uuid/v1');
//Google Recaptcha
const Recaptcha = require('express-recaptcha').RecaptchaV2;
//or with options
var recaptcha = new Recaptcha('6Lcf0qEUAAAAAMiQsJC2mFXsIk5du9hux_gcrznq', '6Lcf0qEUAAAAAN4dkaSxXSzdAj7IWBnP_8nSWaSf', {callback:'console.log("Captcha loaded")', action: 'login'});

//Postgresql database
var pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

var pgPool = new pg.Pool({
  user: 'zcpendaftaran',
  host: 'localhost',
  database: 'zcpendaftaran',
  password: 'admin2019',
  port: 5432
});  

const app = express()
const port = 3000

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/", express.static(__dirname + '/views')); // Set all static assets in /views folder
app.set('views', './views'); // Set all static assets in /views folder
app.set('view engine', 'ejs'); //Set all html extension to ejs(embedded javascript https://ejs.co/)

//Routes
app.get('/', (req, res) => 
	res.render('home'))

app.get('/register', recaptcha.middleware.render, function (req, res, next) {
  var msg = req.query.valid;
  res.render('register', {ermes: msg, captcha:res.recaptcha});
})

app.post('/register-request', recaptcha.middleware.verify, function(req, res, next) {
  if (!req.recaptcha.error) {//Captcha validation
    if(req.body.pwd === req.body.upwd){//Login password validation
	    db.query(db.findProfile, [req.body.email], function(err,resp){
	      if(err){//If Query error
	        return next(err);
	      }
	      
	      if(resp.rows[0]){//Email duplicate checker
	        var str = encodeURIComponent('Email sudah terdaftar');
	        res.redirect('/register/?valid=' + str);
	      } else {//If everything is good
	        db.query(db.addProfile, [req.body.nama, req.body.alamat, req.body.phone, req.body.email, req.body.sekolah, req.body.kelas, req.body.jurusan, req.body.ig, enc.encrypt(req.body.pwd), uuidv1()], (err, resp) => {
	          if (err) {
	            return next(err)
	          }
	          res.send('Data terkirim');
	        })
	      } 
	    }) 
	} else {//Login password validation
	    var str = encodeURIComponent('Password tidak cocok');
	    res.redirect('/register/?valid=' + str);
	}
  } else {//Captcha validation
    var str = encodeURIComponent('Captcha tidak terisi');
	res.redirect('/register/?valid=' + str);
  }  
})



//Routes end

app.listen(port, () => console.log(`Example app listening on port ${port}!`))