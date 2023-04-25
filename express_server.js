const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;
app.set("view engine", "ejs");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { getUserByEmail, generateRandomString, urlsForUser, getUserById } = require('./views/helpers');


const urlDatabase = {};

const users = {};

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (userId && getUserById(userId, users)) {
     res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  
  if (!userID) {
    res.statusCode = 401;
  }
  
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).send("You need to be logged in to create short URLs.");
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userId };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get("/urls/new", (req, res) => {
  const user = getUserById(req.session.user_id,users);
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

  if (!user || url.userId !== user.id) {
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
  const userId = req.session.user_id;
  const user = getUserById(userId, users);
  
  if (user) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  
  if (user && bcrypt.compareSync(password, user.password)) { 
    const userId = user.id;
  
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.status(403).render('login', { error: 'Invalid email or password.' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = getUserById(userId, users);

  if (user) {
    // user already logged in, redirect to urls page
    res.redirect('/urls');
    return;
  }

  res.render('register' );
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email,users);

  if (email === "" || password === "") {
    const templateVars = { user: null, error: "Please fill in all fields" };
    res.status(400).render('register', templateVars);
  } else if (user) {
    const templateVars = { user: null, error: "Email already exists" };
    res.status(400).render('register', templateVars);
  } else {
    const userId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10); // hash and salt the password
    users[userId] = { id: userId, email, password: hashedPassword };
    req.session.userId = users[userId].id; 
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
  if (url.userId !== req.session.user_id) {
    return res.status(403).send("Forbidden");
  }
  res.render("urls_show", { shortURL, longURL: url.longURL, user });
});

app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;
  const url = urlDatabase[shortUrl];
  const user = users[userId] || null;

  if (!url) {
    console.log(`Short URL ${shortUrl} not found`);
    return res.status(404).send("Short URL not found");
  }

  if (!user || url.userId !== userId) {
    console.log(`User ${userId} does not have permission to edit short URL ${shortUrl}`);
    return res.status(403).send("Forbidden");
  }

  url.longURL = req.body.longURL;
  console.log(`Updated long URL for short URL ${shortUrl}`);

  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (url) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send('<h1>URL not found</h1><p>The shortened URL you are trying to access does not exist.</p>');
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});