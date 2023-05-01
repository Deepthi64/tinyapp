const { assert } = require('chai');

const { getUserByEmail } = require('../helpers/helpers.js');
const { urlsForUser } = require('../helpers/helpers.js');
const { getUserById } = require('../helpers/helpers.js');
const { generateRandomString } = require('../helpers/helpers.js');

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

describe('generateRandomString', function() {

  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, testUsers.userRandomID);
  });
  it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('maya@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

const testUrls = {
  'reen': {
    longURL: 'http://www.freecodecamp.org',
    userId: 'carol'
  },
  'jon': {
    longURL: 'http://www.reddit.com',
    userId: 'diya'
  },
  'matt': {
    longURL: 'http://www.lighthouselabs.ca',
    userId: 'diya'
  }
};

describe('urlsForUser', function() {

  it('should return an object of url information specific to the given user ID', function() {
    const actual = urlsForUser("diya", testUrls);
    const expectedOutput = {
      "jon": {
        longURL: "http://www.reddit.com",
        userId: "diya"
      },
      "matt": {
        longURL: "http://www.lighthouselabs.ca",
        userId: "diya"
      }
     
    };
    assert.deepEqual(actual, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function() {
    const acc = urlsForUser(" maya", testUrls);
    const expectedOutput = {};
    assert.deepEqual(acc, expectedOutput);
  });
});

describe('getUserById', function() {
  

  it('should return the user object when given a valid user ID', function() {
    const id = "userRandomID";
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    const actualOutput = getUserById(id, testUsers);
    assert.deepEqual(actualOutput, expectedOutput);
  });

  it('should return null when given an invalid user ID', function() {
    const id = "user4";
    const expectedOutput = null;
    const actualOutput = getUserById(id, testUsers);
    assert.strictEqual(actualOutput, expectedOutput);
  });
});