const Pool = require('pg').Pool

//Domainesia Database
const pool = new Pool({
  user: 'zcpendaftaran',
  host: 'localhost',
  database: 'zcpendaftaran',
  password: 'admin2019',
  port: 5432
});

const addProfile = 'insert into profiles (nama, alamat, phone, email, sekolah, kelas, jurusan, ig, pwd, uuid) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
const findProfile = 'select * from profiles where email = $1'
const findProfileByUuid = 'select * from profiles where uuid = $1'
const addAccounts = 'insert into accounts (uuid, uname, pwd) values($1,$2,$3)'
const findAccount = 'select * from accounts where uuid = $1'
const deleteAccount = 'delete from accounts where uname = $1'

//Webfaction Database
const wfpool = new Pool({
  user: 'tonline',
  host: 'wf-103-44-220-83.webfaction.com',
  database: 'tonline',
  password: 'tonline2000',
  port: 5432
})

const findUser = 'select * from users'

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  addProfile,
  findProfile, 
  findProfileByUuid,
  addAccounts,
  findAccount,
  deleteAccount,
  wfquery: (wftext, wfparams, wfcallback) => {
    return wfpool.query(wftext, wfparams, wfcallback)
  },
  findUser
}