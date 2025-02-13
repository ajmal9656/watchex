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
const createError = require("http-errors");
const { MONGO_URL } = require("./secret");
const dotenv = require('dotenv')


dotenv.config()

const mongoose=require("mongoose");

console.log("mongo",MONGO_URL);


mongoose.connect(MONGO_URL).then((res)=>{
  console.log("connected");
  
}).catch((err)=>{
  console.log(err);
  
});

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; 

  // render the error page
  res.status(err.status || 500);
  res.render('error',{ error: res.locals.message,status:err.status});
});


app.listen(3000, () => {
  console.log("started http://localhost:300/ ,http://localhost:3000/");
});
