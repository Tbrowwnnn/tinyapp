const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require("bcryptjs");


function generateRandomString(){

    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
  
}

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  "6030f2": {
    id: "6030f2",
    email: "user@example.com", 
    password: "purple-monkey-dinosaur", 
  },
  "7eleven": {
    id: "7eleven",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const usernameAndPasswordChecker = function(ObjDataBase, comparable, email, id){
  let matched = '';

  for(compare in ObjDataBase){
    if(ObjDataBase[compare][email] === comparable){
      matched = ObjDataBase[compare][id];
    }
  }return matched;
}

const PasswordChecker = function(ObjDataBase, comparable, pass){
  let matched = false;

  for(compare in ObjDataBase){
    if(bcrypt.compareSync(comparable, ObjDataBase[compare][pass])){
      matched = true;
    }
  }return matched;
}

const urlsForUser = function(obj, id, userKey){
  filteredUrl = {};

  for(matching in obj){
    if(id === obj[matching][userKey]){
      filteredUrl[matching] = obj[matching];
    }
  }return filteredUrl;
}
//This post handles the registration information
app.post("/register", (req, res) => {

  if(usernameAndPasswordChecker(users, req.body.email, "email","id") !== '' || req.body.email === "" || req.body.password === ""){
    res.status(400)
    res.send('Invalid username or password');
  }
  else
 { let randomid = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  res.cookie("user_ID", `${randomid}`)
  users[randomid] = {id: randomid, email: req.body.email, password: hashedPassword};
  res.redirect("/urls");}
  console.log(users);
})

//This post adds both longURL, tinyURL, and cookie ID to the URLDatabase 
app.post("/urls", (req, res) => {
  // console.log(req.body);
  let tinyVar = generateRandomString();

  urlDatabase[tinyVar] = {longURL: req.body.longURL, userID: req.cookies.user_ID};
  res.redirect(`/urls/${tinyVar}`)
})

//This edits entries in the URL database
app.post("/urls/:id/edit", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const matchy = req.params.id

  if(!filteredUrl[matchy]){
    res.status(400)
    
    res.send("you do not have permission to delete this file")
  }
  else

  {urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls")}
})

//This deletes entries from URL database
app.post("/urls/:id/delete", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const matchy = req.params.id
  

  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID")
  
  if(!filteredUrl[matchy]){
    res.status(400)
    
    res.send("you do not have permission to delete this file")
  }else{

  delete urlDatabase[req.params.id]
  res.redirect("/urls");}
})

app.set("view engine", "ejs");

//This deals with logging in
app.post("/login", (req, res) => {

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const emailCorrect = usernameAndPasswordChecker(users, req.body.email, "email","id")
  // const passCorrect = usernameAndPasswordChecker(users, req.body.password, "password","id")
  const passCorrect = PasswordChecker(users, req.body.password, "password")
  
  console.log("users",)
  if( emailCorrect === '') {
    res.status(403)
    res.send("Username not found")
  }
  if(emailCorrect !== ''){
    if(!passCorrect){
      res.status(403)
      res.send("invalid password")
    }else { 
      res.cookie("user_ID", `${usernameAndPasswordChecker(users, req.body.email, "email","id")}`)
      res.redirect("/urls");}
      // console.log(users[id]);
  }
})

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/login");
})

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "7eleven"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "6030f2"
  },
  '03ceb0': { longURL: 'holy cow', userID: '6030f2' }
}
// console.log(urlsForUser(urlDatabase, "7eleven", "userID" ))
app.get("/register", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = {userID}
  console.log(users.cookieName)
  console.log(users)

  res.render("urls_register", templateVars);
})

app.get("/urls", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID") 
  console.log("userID", cookieName)
  if(!cookieName){
    res.redirect("/login")}
    else
  {const templateVars = { urls: filteredUrl, userID};
  res.render("urls_index", templateVars)};
});

app.get("/urls/new", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  if(!cookieName) {
    res.redirect("/login")
  }else
  {const templateVars = { urls: urlDatabase, userID};
  res.render("urls_new", templateVars);}
})

app.get("/login", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const templateVars = { urls: urlDatabase, userID};

  res.render("urls_login", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let cookieName = req.cookies.user_ID;
  const userID = users[cookieName]
  const matchy = req.params.id
  const filteredUrl = urlsForUser(urlDatabase, cookieName, "userID")
  
  if(!filteredUrl[matchy]){
    res.status(400)
    res.send("you do not have permission to access this file")
  }
  if(!cookieName) {
    res.redirect("/login")}
  else{if(!urlDatabase[req.params.id]){
    res.status(403);
    res.send("page does not exist");
  }else {const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, userID};
  console.log(urlDatabase)
  res.render("urls_show", templateVars);}
}})

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL
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