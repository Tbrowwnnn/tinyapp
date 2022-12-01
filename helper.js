const bcrypt = require('bcryptjs');

const usernameAndPasswordChecker = function(ObjDataBase, comparable, email, id){
  let matched = '';

  for(compare in ObjDataBase){
    if(ObjDataBase[compare][email] === comparable){
      matched = ObjDataBase[compare][id];
    }
  }return matched;
}

const PasswordChecker = function(ObjDataBase, comparable, pass){
  let matched = false;

  for(compare in ObjDataBase){
    if(bcrypt.compareSync(comparable, ObjDataBase[compare][pass])){
      matched = true;
    }
  }return matched;
}

const urlsForUser = function(obj, id, userKey){
  filteredUrl = {};

  for(matching in obj){
    if(id === obj[matching][userKey]){
      filteredUrl[matching] = obj[matching];
    }
  }return filteredUrl;
}

module.exports = {
usernameAndPasswordChecker, 
PasswordChecker,
urlsForUser}
