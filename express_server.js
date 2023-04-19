const express = require("express");
const app = express();
const port = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req,res) => {
  const urls = {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };
  res.render("urls_index", { urls });
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:  urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
//app.get("/urls/:id", (req, res) => {
  //const templateVars = { id: req.params.id, longURL: "http://www.google.com" }
  //res.render("urls_show", templateVars);
//});
app.post("/urls", (req, res) => {
 const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL; // Log the POST request body to the console
  res.redirect(302, `/urls/${shortURL}`);
  //res.status(200).send(`Short URL created: ${shortURL}`); // Respond with 'Ok' (we will replace this)
});
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.sendStatus(404);
  } else {
    res.redirect(301, longURL);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});