const express = require('express')
//short Uuid 
const shortid = require('shortid');
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

const app = express();
const port = 62542;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/", express.static(__dirname + '/views')); // Set all static assets in /views folder
app.set('views', './views'); // Set all static assets in /views folder
app.set('view engine', 'ejs'); //Set all html extension to ejs(embedded javascript https://ejs.co/)

//Midtrans Lib
const midtransClient = require('midtrans-client');

// Create Core API instance
const myServerKey = 'Mid-server-Ngb96nsbPKRQD8f7fRVvEgoq';
const myClientKey = 'Mid-client-HSuDacPXv6YxjmgI';
let coreApi = new midtransClient.CoreApi({
        isProduction : true,
        serverKey : myServerKey,
        clientKey : myClientKey
    });

// Create Snap API instance
let snap = new midtransClient.Snap({
        isProduction : true,
        serverKey : myServerKey,
        clientKey : myClientKey
    });

let apiClient = new midtransClient.Snap({
        isProduction : true,
        serverKey : myServerKey,
        clientKey : myClientKey
    });

//Midtrans Lib Ends

//Express Sessions
app.use(ExpressSessions({
  store: new pgSession({
	    pool : pgPool,                // Connection pool
	    tableName : 'session'   // Use another table-name than the default "session" one
  }),
  secret: 'zeniuscentersecretkeyadmin2019',
  resave: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  saveUninitialized:false
}));

//Routes

//home
app.get('/', function(req, res, next){
	if(req.session.uniqueId){
		res.render('home', {uuid: enc.decrypt(req.session.uniqueId)});
	} else {
		res.render('home');
	}
})

//home end
//Registration
app.get('/register', recaptcha.middleware.render, function (req, res, next) {
	if(req.session.uniqueId){
		res.redirect('/');
	} else {
		var msg = req.query.valid;
  		res.render('register', {ermes: msg, captcha:res.recaptcha});		
	}  
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
	      	var myuuid = uuidv1();
	        db.query(db.addProfile, [req.body.nama, req.body.alamat, req.body.phone, req.body.email, req.body.sekolah, req.body.kelas, req.body.jurusan, req.body.ig, enc.encrypt(req.body.pwd), myuuid], (err, resp) => {
	          if (err) {
	            return next(err)
	          }
	          req.session.uniqueId = enc.encrypt(myuuid);
	          res.redirect('/profile/' + myuuid);
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
//Registration end

//Profile
app.get('/profile/:uuid', function(req, res, next) {	
	if((typeof req.session.uniqueId) != 'undefined'){
		if(enc.decrypt(req.session.uniqueId) === req.params.uuid){//check if session uuid is the same as uuid parameter
			db.query(db.findProfileByUuid, [req.params.uuid], (err, resp) => {
				if (err) {
				 return next(err);
				}
				var arr = resp.rows[0];
				var tOrder = '';
				db.query(db.findAccount, [req.session.uniqueId], function(err, respo){			
					if(err){
						return next(err);
					}		
					if(respo.rows[0]){
						var accarr = respo.rows[0];
						res.render('profile', {uuid: enc.decrypt(req.session.uniqueId), nama: arr.nama, email: arr.email, tryout: 'Tryout 23 May 2019', paid:'paid', accounts: {uname: enc.decrypt(accarr.uname), pwd: enc.decrypt(accarr.pwd)}});
					} else {
						var myOrder = "order-" + Math.floor(Math.random() * (+2000 - +1)) + +1;
						let parameter = {
						    "transaction_details": {
						        "order_id": myOrder ,
						        "gross_amount": 1000
						    }, "customer_details": {
					        "name": arr.nama,
					        "email": arr.email,
					        "phone": arr.phone,
					        },
						     "credit_card":{
						        "secure" : true
						    }
						};

						snap.createTransaction(parameter)
						    .then((transaction)=>{
						        // transaction token
						        var mytoken = transaction.token;
						        res.render('profile', {uuid: enc.decrypt(req.session.uniqueId), nama: arr.nama, email: arr.email, tryout: 'Tryout 23 May 2019', paid:'not paid' , mytoken: mytoken, clientKey: myClientKey});	      
							})
							.catch((e)=>{
						        e.message // basic error message string
						        e.httpStatusCode // HTTP status code e.g: 400, 401, etc.
						        e.ApiResponse // JSON of the API response 
						        e.rawHttpClientData // raw Axios response object
						        apiClient.transaction.status(myOrder)
								    .then((response)=>{
								        if(response.transaction_status === "settlement"){
							        		res.send('The payment has been paid!');
							        	} else {
							        		res.send('No payment found');
							        	}
								    });
					        	
					      	})
					}
				})
				
			})		
		} else {
			res.redirect('/');
		}	
	} else {
		res.redirect('/');
	}
})

//login
app.get('/login', function(req, res, next){
	if(req.session.uniqueId){
		res.redirect('/');
	} else {
		var msg = req.query.valid;
		res.render('login', {ermes: msg});
	}
	
})

app.post('/login-request', function(req, res, next){
	if(req.session.uniqueId){
		res.redirect('/')
	} else {
		db.query(db.findProfile, [req.body.email], function(err, resp){
			if(err){
				return next(err);
			}
			if ('undefined' === (typeof resp.rows[0])){
				var str = encodeURIComponent('Password atau Email anda salah');
				res.redirect('/login/?valid=' + str);
			} else {
				var arr = resp.rows[0];
				if(enc.decrypt(arr.pwd) === req.body.pwd){		
					req.session.uniqueId = enc.encrypt(arr.uuid);
					if(req.session.uniqueId){
						res.redirect('/profile/' + arr.uuid);
					}
				} else {
					var str = encodeURIComponent('Password atau Email anda salah');
					res.redirect('/login/?valid=' + str);
				}
			}
			
		})
	}
})

//logout
app.get('/logout', function(req, res, next){
	if(req.session.uniqueId){
		req.session.destroy(function(err) {
		  res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
})

//Add Profile if payment succeed

app.get('/addProf/:uuid' ,function(req, res, next){
	if(enc.decrypt(req.session.uniqueId) === req.params.uuid){
		db.query(db.findProfileByUuid, [req.params.uuid], function(err, respo){
			if(err){
				return next(err);
			}
			var arr = respo.rows[0]
			var myUname = arr.nama;
			var lwUname = myUname.toLowerCase();
			var trimUname = lwUname.trim();
			var slcUname = trimUname.slice(0, 5);
			var uName = slcUname + shortid.generate();
			db.query(db.addAccounts, [enc.encrypt(req.params.uuid), enc.encrypt(uName) ,enc.encrypt('tozeniuscenter119')], function(err, resp){
				if(err){
					return next(err);
				}
				res.redirect('/profile/' + req.params.uuid)
			})
		})
			
	} else {
		res.redirect('/');
	}		
})

//Admin Pages
app.get('/admin', function(req, res, next){
	if(req.session.adminId){
		res.redirect('/admin-home')
	} else {
		var msg= req.query.valid;
		res.render('admin', {ermes: msg});
	}
})

app.post('/admin-login-request', function(req, res, next){
	if(req.session.adminId){
		res.redirect('/');
	} else {	
		if(req.body.pwd === 'zeniuscenter2019'){
			req.session.adminId = 'admin2019';
			res.redirect('/admin-home');
		} else {
			var str = encodeURIComponent('Admin Key salah');
			res.redirect('/admin/?valid=' + str);
		}
	}
})

//Admin Home
app.get('/admin-home', function(req, res, next){
	if(req.session.adminId){
		var msg= req.query.valid;
		res.render('admin-home', {succmes: msg});
	} else {
		res.redirect('/');
	}
})

app.post('/admin-request', function(req, res, next){
	if(req.session.adminId){
		db.query(db.findProfile, [req.body.email], function(err, resp){
			if (err){
				return next(err);
			}
			var arr = resp.rows[0];
			var myUuid = arr.uuid;

			var arrName = arr.nama;
			var lwUname = arrName.toLowerCase();
			var trimUname = lwUname.trim();
			var slcUname = trimUname.slice(0, 5);
			var myUname = 'to-' + slcUname + shortid.generate();

			var myPwd =  slcUname + shortid.generate();

			db.query(db.addAccounts, [enc.encrypt(myUuid), enc.encrypt(myUname), enc.encrypt(myPwd)], function(err, respo){
				var str = encodeURIComponent('Account telah terdaftar');
				res.redirect('/admin-home/?valid=' + str);
			});
		})
	} else {
		req.redirect('/');
	}
})

//admin search
app.post('/admin-search-request', function(req, res, next){
	if(req.session.adminId){
		db.query(db.findProfile, [req.body.searchq], function(err, resp){
			if(err){
				return next(err);
			}
			var myEmail = req.body.searchq;
			var arr = resp.rows[0];
			var myUuid = arr.uuid;
			db.query(db.findAccount, [enc.encrypt(myUuid)], function(err, respo){
				var accarr = respo.rows;
				var unameArr = [];
				accarr.forEach(function(deAcc){
					unameArr.push({uuid: enc.decrypt(deAcc.uuid), uname: enc.decrypt(deAcc.uname), pwd: enc.decrypt(deAcc.pwd), enUname: deAcc.uname})
				})
				res.render('admin-home', {userlist: unameArr, myEmail: myEmail});
			})
		})
	} else {
		res.redirect('/');
	}
})

//admin delete
app.get('/delete-acc/:uname', function(req, res, next){
	if(req.session.adminId){
		db.query(db.deleteAccount, [req.params.uname], function(err, respo){
			if(err){
				return next(err);
			}
			res.redirect('/admin');
		})
	} else {
		res.redirect('/');
	}
})

//Admin Logout
app.get('/admin-logout', function(req, res, next){
	if(req.session.adminId){
		req.session.destroy(function(err) {
		  res.redirect('/');
		})
	} else {
		res.redirect('/');
	}
})

app.get('/wfuser', function(req, res, next){
	db.wfquery(db.findUser, [], function(err, resp){
		if(err){
			return next(err);
		}
		res.send(resp.rows);
	})
})
//Routes end

app.listen(port, () => console.log(`Zenius Center is listening on port ${port}!`))