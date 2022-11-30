const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; //default port 8080


function generateRandomString(){

    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
  
}

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com", 
    password: "purple-monkey-dinosaur", 
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.post("/register", (req, res) => {
  let randomid = generateRandomString();
  res.cookie("user_ID", `${randomid}`)
  users[randomid] = {id: randomid, email: req.body.email, password: req.body.password};
  res.redirect("/urls");
  console.log(users);
})

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let tinyVar = generateRandomString();

  urlDatabase[tinyVar] = req.body.longURL;
  res.redirect(`/urls/${tinyVar}`)
})

app.post("/urls/:id/edit", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
})

app.set("view engine", "ejs");

app.post("/urls/login", (req, res) => {
  res.cookie("username",`${req.body.username}`)
  res.redirect("/urls");
})

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
})

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/register", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = { userID}
  console.log(users.cookieName)
  console.log(users)

  res.render("urls_register", templateVars);
})

app.get("/urls", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = { urls: urlDatabase, userID};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = { urls: urlDatabase, userID};
  res.render("urls_new", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id],userID};
  res.render("urls_show", templateVars);
})

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n") 

});