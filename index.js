const express = require("express");
const path = require("path");
const app = express();
const session=require("express-session");
const nocache = require("nocache");
const userAuthRoute=require("./routes/userAuth");
const adminAuthRoute=require("./routes/adminAuth");
const bodyParser = require('body-parser');
const methodoverride=require('method-override');
const flash=require("express-flash");

const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/watcheXapp");

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());
app.use(methodoverride('_method'));

app.use(
    session({
      secret: "1231fdsdfssg33435",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(flash());
app.use((req,res,next)=>{
  res.locals.message=req.session.message;
  delete req.session.message;
  next();
})
app.use("/",nocache());




app.use('/',userAuthRoute);
app.use('/admin',adminAuthRoute)


app.listen(300, () => {
  console.log("started http://localhost:300/ ,http://localhost:3000/");
});
