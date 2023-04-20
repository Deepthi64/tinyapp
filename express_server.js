const express = require("express");
const app = express();
const port = 3000;
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
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.sendStatus(404);
  } else {
    res.redirect(longURL);
  }
});
app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(302, `/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL])  {
    res.sendStatus(404);
  } else {
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL] = newLongURL;
   // console.log(`old url is set to: ${urlDatabase[shortURL].longURL}`);
    console.log(`newLongURL is set to : ${newLongURL}`);
    console.log(`shortURL is set to: ${shortURL}`);
    console.log("url database", urlDatabase);
    res.redirect("/urls");
  }
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {longURL, id:shortURL}
  if (!longURL) {
    res.sendStatus(404);
  } else {
    res.render("urls_show", templateVars);
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {longURL, id:shortURL}
  if (!longURL) {
    res.sendStatus(404);
  } else {
    res.render("urls_show", templateVars);
  }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});