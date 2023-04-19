const express = require("express");
const app = express();
const port = 8080;
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req,res) => {
  const urls = {  greeting: "urls_index" };
    res.render("urls_index", { urls });
  }
);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});