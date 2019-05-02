const express = require('express')
const bodyParser = require('body-parser');
const ExpressSessions = require('express-session'); 
const expressValidator = require('express-validator');
const fs= require('fs');
const db = require('./db');
const enc = require('./encrypt');

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

app.get('/register', (req, res) => 
	res.render('register'))

app.post('/register-request', (req, res, next) =>
	db.query(db.addProfile, [req.body.nama, req.body.alamat, req.body.phone, req.body.email, req.body.sekolah, req.body.kelas, req.body.jurusan, req.body.ig], (err, resp) => {
	    if (err) {
	      return next(err)
	    }
	    res.send('Data terkirim');
  	})
)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))