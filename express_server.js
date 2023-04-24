const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;
app.set("view engine", "ejs");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//const requireLogin = (req, res, next) => {
  //if (!req.session.userID) {
    //return res.redirect('/login');
  //}
  //next();
//};

function generateRandomString() { 
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}
function getUserById(id) {
  for (const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
}

function urlsForUser(id, database) {
  const userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  
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

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  const userId = req.cookies.user_id;
  if (userId && getUserById(userId)) {
    // User is logged in, redirect to /urls
    res.redirect('/urls');
  } else {
    // User is not logged in, redirect to /login
    res.redirect('/login');
  }
});



app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  
  if (!userID) {
    res.statusCode = 401;
  }
  
  res.render('urls_index', templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // Access the longURL value from req.body
  const userID = req.session.user_id;
  
  urlDatabase[shortURL] = { longURL: longURL, userID: userID }; // Set longURL to the actual URL string
  
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user, error: "" };
  res.render("urls_new", templateVars);
});



app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];
  if (urlObj) {
    res.redirect(urlObj.longURL);
  } else {
   
  res.status(404).render('error', { user: users[req.session.userID], message: ' Short Url does not exists!' });

  }
});

app.post('/urls/:shortUrl/delete', (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortUrl;
  const url = urlDatabase[shortUrl];
  const user = users[userId] || null;
  
  if (!url) {
    console.log(`Short URL ${shortUrl} not found`);
    return res.status(404).send("Short URL not found");
  }

  if (!user || url.userID !== user.id) {
    console.log(`User ${userId} does not have permission to delete short URL ${shortUrl}`);
    return res.status(403).send("Forbidden");
  }

  delete urlDatabase[shortUrl];
  console.log(`Deleted short URL ${shortUrl}`);

  res.redirect('/urls');
});

app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL])  {
    res.sendStatus(404);
  } else {
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL] = newLongURL;
    res.redirect("/urls");
  }
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    // Short URL not found
    return res.sendStatus(404);
  }
  
  const url = urlDatabase[shortURL];
  const user = users[req.session.user_id];
  const longURL = urlDatabase[shortURL];
  const templateVars = {longURL, id:shortURL, url:url}
  
  if (!user || url.userID !== user.id) {
    return res.sendStatus(403);
  } else {
    res.render("urls_show", templateVars);
  }
});
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = getUserById(userId);
  
  if (user) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  
  if (user && user.password === password) {
    const userId = user.id;
    // Save the user ID to the user's cookies
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    res.status(403).render('login', { error: 'Invalid email or password.' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = getUserById(userId);

  if (user) {
    // user already logged in, redirect to urls page
    res.redirect('/urls');
    return;
  }

  res.render('register' );
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (email === "" || password === "") {
    const templateVars = { user: null, error: "Please fill in all fields" };
    res.status(400).render('register', templateVars);
  } else if (user) {
    const templateVars = { user: null, error: "Email already exists" };
    res.status(400).render('register', templateVars);
  } else {
    const userId = generateRandomString();
    users[userId] = { id: userId, email, password };
    req.session.userId = users[userId].id; // fix here
    const templateVars = { user: { email }, success: "You have successfully registered!" };
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("Short URL not found");
  }
  let user = null;
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  if (url.userID !== (user && user.id)) {
    return res.status(403).send("Forbidden");
  }
  res.render("urls_show", { shortURL, longURL: url.longURL, user });
});


app.post('/urls/:shortUrl', (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortUrl;
  const url = urlDatabase[shortUrl];
  const user = users[userId] || null;

  if (!url) {
    console.log(`Short URL ${shortUrl} not found`);
    return res.status(404).send("Short URL not found");
  }

  if (!user || url.userID !== userId) {
    console.log(`User ${userId} does not have permission to edit short URL ${shortUrl}`);
    return res.status(403).send("Forbidden");
  }

  url.longURL = req.body.longURL;
  console.log(`Updated long URL for short URL ${shortUrl}`);

  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const url = url[id];

  if (url) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send('<h1>URL not found</h1>');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});