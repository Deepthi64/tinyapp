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
  const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" }
  res.render("urls_show", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: "http://www.google.com" }
  res.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});