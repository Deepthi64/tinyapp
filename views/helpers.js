function generateRandomString() { 
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function getUserByEmail(email, users) {
  
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return  undefined;
}
function getUserById(id,users) {
  
  for (const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
}

function urlsForUser(id, database) {
  let userUrls = {};
  
  for (const shortURL in database) {
    if (database[shortURL].userId === id) {
      userUrls[shortURL] = database[shortURL]; 
    }
  }
   return userUrls;
} 

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getUserById };