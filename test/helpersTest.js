const { assert } = require('chai');

const { usernameAndPasswordChecker} = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = usernameAndPasswordChecker(testUsers, "user@example.com", 'email', 'id')
    const expectedUserID = "userRandomID";
    
    assert.equal(user, expectedUserID)
  });
  it('should return a user with undefined', function() {
    const user = usernameAndPasswordChecker(testUsers, "no@example.com", 'email', 'id')
    const expectedUserID = '';
    
    assert.equal(user, expectedUserID)
  });
  it('should return a user with user2@example.com', function() {
    const user = usernameAndPasswordChecker(testUsers, "user2@example.com", 'email', 'email')
    const expectedUserID = 'user2@example.com';
    
    assert.equal(user, expectedUserID)
  });
  it('should return a user with valid email', function() {
    const user = usernameAndPasswordChecker(testUsers, "user2@example.com", 'email', 'id')
    const expectedUserID = "user2RandomID";
    
    assert.equal(user, expectedUserID)
  });

});