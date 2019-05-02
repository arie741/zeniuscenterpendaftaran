// Nodejs encryption with CTR
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'asjhd80sasau80A&(S*DAD%TADasidasvbduyisadsavuyasgdsad7tad7a876';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
	encrypt,
	decrypt
}	