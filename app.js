const express = require('express')
const bodyParser = require('body-parser');
const ExpressSessions = require('express-session'); 
const expressValidator = require('express-validator');
const fs= require('fs');
const db = require('./db');
const enc = require('./encrypt');
const uuidv1 = require('uuid/v1');

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
app.use("/", express.static(__dirname + '/views'));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => 
	res.render('home'))

app.get('/register', function (req, res, next) {
  var msg = req.query.valid;
  res.render('register', {ermes: msg});
})

app.post('/register-request', function(req, res, next) {
  if(req.body.pwd === req.body.upwd){
    db.query(db.findProfile, [req.body.email], function(err,resp){
      if(err){
        return next(err);
      }
      
      if(resp.rows[0]){
        var str = encodeURIComponent('Email sudah terdaftar');
        res.redirect('/register/?valid=' + str);
      } else {
        db.query(db.addProfile, [req.body.nama, req.body.alamat, req.body.phone, req.body.email, req.body.sekolah, req.body.kelas, req.body.jurusan, req.body.ig, enc.encrypt(req.body.pwd), uuidv1()], (err, resp) => {
          if (err) {
            return next(err)
          }
          res.send('Data terkirim');
        })
      } 
    }) 
  } else {
    var str = encodeURIComponent('Password tidak cocok');
    res.redirect('/register/?valid=' + str);
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))