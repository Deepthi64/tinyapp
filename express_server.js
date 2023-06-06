const express = require('express');
const app = express();
const port = 3000;
app.set("view engine", "ejs");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
app.use(express.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { getUserByEmail, generateRandomString, urlsForUser, getUserById } = require('./helpers/helpers');


const urlDatabase = {};

const users = {};

app.use(cookieSession({
  name: 'session',
  keys: ['mySecretKey'],
  maxAge: 24 * 60 * 60 * 1000 
}));


// GET /urls - Display the list of URLs
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
   return res.send("<p>Please login to view this page!.Click on <a href = '/login'>this</a> link</p>");
  }
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls, user: users[userId] , urlDatabase };
    res.render('urls_index',templateVars);
  });

  // GET /urls/new - Display the form to create a new URL
  app.get("/urls/new", (req, res) => {
    const user = getUserById(req.session.user_id,users);
    if (!user) {
      res.redirect("/login");
      return;
    }
    const templateVars = { user, error: "" };
    res.render("urls_new", templateVars);
  });
  
  // GET /register - Display the registration form
  app.get('/register', (req, res) => {
    const userId = req.session.user_id;
    const user = getUserById(userId, users);
  
    if (user) {
      res.redirect('/urls');
      return;
    }
  
    res.render('register' );
  });
  
  // GET /urls/:shortURL/edit - Display the form to edit a URL
  app.get("/urls/:shortURL/edit", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL];
    const templateVars = { shortURL: shortURL, longURL: url.longURL, user: user };
    if (!user) {
      return res.redirect("/login");
    }
    if (!url) {
      return res.sendStatus(404);
    }
    if (url.userId !== user.id) {
      return res.status(403).send("NOT AUTHORIZED TO UPDATE!");
    }
    res.render("urls_edit", templateVars);
  });

  // GET / - Redirect to the appropriate page based on the user's login status
  app.get('/', (req, res) => {
    const userId = req.session.user_id;
    if (userId) {
      res.redirect('/urls');
    } 
      res.redirect('/login');
    });

  // GET /login - Display the login form
  app.get('/login', (req, res) => {
    const userId = req.session.user_id;
    const user = getUserById(userId, users);
    
    if (user) {
     return  res.redirect('/urls');
    } 
     res.render('login');
    });
    
    // GET /urls/:shortURL - Display details of a specific URL
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

   // Redirects to the original long URL based on the provided shortened URL ID
    app.get('/u/:id', (req, res) => {
      const id = req.params.id;
      const url = urlDatabase[id];
     
      if (!url) {
        return res.status(404).send('<h1>URL not found</h1><p>The shortened URL you are trying to access does not exist.</p>');
        
      } 
      res.redirect(url.longURL);
      });

      // Displays a logout success message with a link to the login page
      app.get('/logout', (req, res) => {
        res.send('Log out successful. <a href ="/login">login here</a>');
      });
      
    // Creates a new short URL
    app.post("/urls", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
     return res.status(401).send("You need to be logged in to create short URLs.");
    }  
      const longURL = req.body.longURL;
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = { longURL, userId };
      res.redirect(`/urls/${shortURL}`);
    });

    // Handles user login
    app.post('/login', (req, res) => {
      const { email, password } = req.body;
      const user = getUserByEmail(email, users);
      if (!user) {
        return res.status(403).send(" Email not found!");
      }
      if (!bcrypt.compareSync(password, user.password)) { 
        
       return res.status(403).send('Invalid password.');
      }
      const userId = user.id;
      req.session.user_id = userId; 
      res.redirect('/urls');
      
    });

    // Handles user logout
    app.post('/logout', (req, res) => {
      req.session = null;
      res.clearCookie('user_id');
      res.redirect('/logout');
    });

    // Registers a new user
    app.post('/register', (req, res) => {
      const { email, password } = req.body;
      const user = getUserByEmail(email,users);
    
      if (email === "" || password === "") {
        const templateVars = { user: null, error: "Please fill in all fields" };
        return res.status(400).render('register', templateVars);
      } 
      if (user) {
        const templateVars = { user: null, error: "Email already exists" };
        return res.status(400).render('register', templateVars);
      } 
        const userId = generateRandomString();
        const hashedPassword = bcrypt.hashSync(password, 10); 
        users[userId] = { id: userId, email, password: hashedPassword };
        req.session.user_id = users[userId].id; 
        res.redirect('/urls');
      }); 

      // Edits longURL 
      app.post("/urls/:shortURL/edit", (req, res) => {
        const user = users[req.session.user_id];
        const shortURL = req.params.shortURL;
        const newLongURL = req.body.longURL;
        if (!user) {
          return res.redirect("/login");
        }
        if (!urlDatabase[shortURL]) {
          return res.sendStatus(404);
        }
        if (urlDatabase[shortURL].userId !== user.id) {
          return res.status(403).send("NOT AUTHORIZED TO UPDATE!");
        }
        urlDatabase[shortURL].longURL = newLongURL;
        res.redirect("/urls");
      });

      
       app.post('/urls/:shortURL', (req, res) => {
       const userId = req.session.user_id;
       const shortUrl = req.params.shortURL;
       const url = urlDatabase[shortUrl];
       const user = users[userId] || null;

      if (!url) {
        return res.status(404).send("Short URL not found");
      }
      if (!user || url.userId !== userId) {
        return res.status(403).send("Forbidden");
      }
        url.longURL = req.body.longURL;
        res.redirect('/urls');
     });
    
     // Deletes the url 
     app.post('/urls/:shortUrl/delete', (req, res) => {
     const userId = req.session.user_id;
     const shortUrl = req.params.shortUrl;
     const url = urlDatabase[shortUrl];
     const user = users[userId] || null;
     if (!userId) {
       return res.send("<p>Please login to view this page!.Click on <a href = '/login'>this</a> link</p>");
     }
     if (!user || url.userId !== user.id) {
       return res.status(403).send("Forbidden");
     }
     if (!url) {
       return res.status(404).send("Short URL not found");
      }
      delete urlDatabase[shortUrl];
      res.redirect('/urls');
    });

app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`);
});