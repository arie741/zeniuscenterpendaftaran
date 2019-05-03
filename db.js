const Pool = require('pg').Pool

const pool = new Pool({
  user: 'zcpendaftaran',
  host: 'localhost',
  database: 'zcpendaftaran',
  password: 'admin2019',
  port: 5432
});

const addProfile = 'insert into profiles (nama, alamat, phone, email, sekolah, kelas, jurusan, ig, pwd, uuid) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
const findProfile = 'select * from profiles where email = $1'

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  addProfile,
  findProfile
}