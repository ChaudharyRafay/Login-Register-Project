require("dotenv").config();//always on top (dotenv used for hide imp data from world)
const express=require("express");
const hbs=require("hbs");
const async = require("hbs/lib/async");
const path  = require("path");// for path dealing
const bcrypt=require("bcryptjs");
const app=express();
require("./db/conn");// for including db file
const Register=require("./models/schema");
const { json }=require("express");
const port=process.env.PORT ||8000;
// const port=require("port"); // for port


//staticpath say yeh css images wagara uthay ga
const static_path=path.join(__dirname,"../public");//.. aik folder bahir gya fr public folder k andr gya
//template path say yeh views kay andr index file uthay ga
const templatepath = path.join(__dirname, "../templates/views");//this tells kay ab ham nay template folder k andr views folder rakh dia ha tu system template kay andr ja kay views ka folder dekhay
//partials path
const partial_path=path.join(__dirname,"../templates/partials");

app.use(express.json());//for json format
app.use(express.urlencoded({extended:false}));//when we r using browser to get data not use postman 
app.use(express.static(static_path));//for serving public folder kay andr wali file(html files)
//for serving hbs files
app.set('view engine', 'hbs');
app.set('views',templatepath);//ismay ham nay template path btaya ha
hbs.registerPartials(partial_path);//for registering partials
app.get("/",(req,res)=>{
    res.render('index');// for rendering index file that present in viws filder
});
app.get("/login",(req,res)=>{
    res.render('login');
});
app.get("/register",(req,res)=>{
    res.render('register');
});
// for storinf data in mongodb
app.post("/register",async(req,res)=>{
  try {
      const pass=req.body.password; // for getting user pass and compare it them
      const cpass=req.body.confirmpassword;
      if(pass===cpass){
      const registeruser=new Register({//for store data into mong0db
          fullname:req.body.fullname,// left side fullname schema may jo name ha wo show kr rha ha aur right side may jo fullname ha wo registered.hbs file may jo input tag kay andr name=... ha wo show kr rha ha
          username:req.body.username,
          email:req.body.email,
          phoneno:req.body.phoneno,
          password:req.body.password,
          confirmpassword:req.body.confirmpassword,
          gender:req.body.gender
      });
    //   console.log("the frst part succes is"+registeruser);
      //after getting data from user than ham nay save ni krna data db may us say pahlay hamay password ko hash krna ha is ka code ha yeh
      //this code also called middleware because it works btw 2 codes 
      //ham nay schemea file kay andr aik function declare kra dia ha wo pre ha mtlb kay save krnay say pahlay wo function call hoga aur us ko yha call krnanay ki zrorat ni ha wo automaticallu pre word ki waja say save say pahlay call hojai ga 
      const token= await registeruser.generateusertoken(); //function calling
    //   console.log("Token part is "+token);
      const registered=await registeruser.save();
    //    console.log("the page part is "+registered);
      res.status(201).render("index"); //for display home page
      }else{
          res.send("Password not matched");
      }
  } catch (error) {
      res.status(400).send(error);
  }
});

//for login code to chcekc email pass exists in db or not
app.post("/login",async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.pass;
         //register shows jo uper var may store ha models ka schema
        const useremail=await Register.findOne({email:email})//frst email shows a database emial and second email shows user entered email
        //for checking hashing password
        const ismatch=await bcrypt.compare(password,useremail.password);//frst pass is user enter pass second pass is database existing pass
        //bcrypt returns either true or flase if true than display index page else not

        //token generator
        const token=await useremail.generateusertoken();//becaiuse useremail is a instanse of Register
        // console.log("the login token is"+token);
        if(ismatch){//second pass jo user nay enter kia ha aur useremail.password mtlb db kay andr ka password
            res.status(200).render("index");
        } else{
            res.status(400).send("Password not matched please ennter correct password")
        }
    } catch (error) {
        res.status(400).send("invalid email");
    }
})
app.get("/404error",(req,res)=>{
    res.render('404');
});
app.listen(port,()=>{
console.log(`Server running at ${port}`);
});