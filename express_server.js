const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require("bcryptjs");
const { usernameAndPasswordChecker, PasswordChecker, urlsForUser } = require('./helper');

function generateRandomString() {

  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['keynum1', 'keynum2']

}));

//this is where the users are stored
const users = {

};

//This post handles the registration information
app.post("/register", (req, res) => {

  if (usernameAndPasswordChecker(users, req.body.email, "email", "id") !== '' || req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('Invalid username or password');
  }
  else {
    let randomid = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);


    req.session.user_ID = randomid;
    users[randomid] = { id: randomid, email: req.body.email, password: hashedPassword };
    res.redirect("/urls");
  }
});

//This post adds both longURL, tinyURL, and cookie ID to the URLDatabase 
app.post("/urls", (req, res) => {

  let tinyVar = generateRandomString();

  urlDatabase[tinyVar] = { longURL: req.body.longURL, userID: req.session.user_ID };
  res.redirect(`/urls/${tinyVar}`);
});

//This edits entries in the URL database
app.post("/urls/:id/edit", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const matchy = req.params.id;

  //check if filtered URL list matches their userID. If not throw status code 400
  if (!filteredUrl[matchy]) {
    res.status(400);
    res.send("you do not have permission to delete this file");
  }
  else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//This deletes entries from URL database
app.post("/urls/:id/delete", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const matchy = req.params.id;
  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID");

  //only let them do so if the URL matches their userID
  if (!filteredUrl[matchy]) {
    res.status(400);

    res.send("you do not have permission to delete this file");
  } else {

    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

app.set("view engine", "ejs");

//This deals with logging in
app.post("/login", (req, res) => {

  const emailCorrect = usernameAndPasswordChecker(users, req.body.email, "email", "id");
  const passCorrect = PasswordChecker(users, req.body.password, "password");

  if (emailCorrect === '') {
    res.status(403);
    res.send("Username not found");
  }
  if (emailCorrect !== '') {
    if (!passCorrect) {
      res.status(403);
      res.send("invalid password");
    } else {
      req.session.user_ID = `${usernameAndPasswordChecker(users, req.body.email, "email", "id")}`;
      res.redirect("/urls");
    }
  }
});

app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

const urlDatabase = {

};

//renders registration page
app.get("/register", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const templateVars = { userID };

  res.render("urls_register", templateVars);
});

//rederns url index page if they are logged in, otherwise redirect to login page 
app.get("/urls", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID");

  if (!cookieName) {
    res.redirect("/login");
  }
  else {
    const templateVars = { urls: filteredUrl, userID };
    res.render("urls_index", templateVars);
  };
});

//renders url new page if they are logged in, otherwise redirect to login page
app.get("/urls/new", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  if (!cookieName) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, userID };
    res.render("urls_new", templateVars);
  }
});

//renders login page
app.get("/login", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const templateVars = { urls: urlDatabase, userID };

  res.render("urls_login", templateVars);
});

//renders editing, will filter out URL's that are not listed under userID, and will fail if they try to access a page that is not theirs.
app.get("/urls/:id", (req, res) => {
  let cookieName = req.session.user_ID;
  const userID = users[cookieName];
  const matchy = req.params.id;
  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID");

  if (!filteredUrl[matchy]) {
    res.status(400);
    res.send("you do not have permission to access this file");
  }
  if (!cookieName) {
    res.redirect("/login");
  }
  else {
    if (!urlDatabase[req.params.id]) {
      res.status(403);
      res.send("page does not exist");
    } else {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, userID };
      res.render("urls_show", templateVars);
    }
  }
});

//allows use of tinyURL and name will redirect person to longURL 
app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//takes you to login page upon initialization since there is not home page. 
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
