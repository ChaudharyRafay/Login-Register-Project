require("dotenv").config();//always on top (dotenv used for hide imp data from world)
const auth=require("./middleware/auth");
const express=require("express");
const hbs=require("hbs");
const jwt=require("jsonwebtoken");
const async = require("hbs/lib/async");
const cookieparser=require("cookie-parser");//for cookies
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
app.use(cookieparser());//for cookie parser
app.use(express.urlencoded({extended:false}));//when we r using browser to get data not use postman 
app.use(express.static(static_path));//for serving public folder kay andr wali file(html files)
//for serving hbs files
app.set('view engine', 'hbs');
app.set('views',templatepath);//ismay ham nay template path btaya ha
hbs.registerPartials(partial_path);//for registering partials
app.get("/",(req,res)=>{
    res.render('index');// for rendering index file that present in viws filder
});
app.get("/secret",auth,(req,res)=>{//auth middleware func ka name ha is say yerh hoga kay jb user is page pay janay k liay button dbay ga tu pahlay us ki authetenction chck hogi fr yeh secret page render hoga 
    console.log(`this is cookie ${req.cookies.jwt}`);//req.cookies.jwt say hamay wo token no mil jai ga jo user nay login ya register krtay waqt create hoa ta 
    res.render('secret');
});
app.get("/login",(req,res)=>{
    res.render('login');
});
app.get("/register",(req,res)=>{
    res.render('register');
});
app.get("/logout",auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((currobj)=>{//curr obj means db may tokens kay andr objects bnay hoay ha ku kay token array of an obj ha tu us obj ko filter krnay k liay yeh likha ha filter mtlb delete krna db may say
            return currobj.token !== req.token; //currobj.token mtlb obj kay andr aik token parha hoyta ha wo token not equal to current token jo cookie may para ha 
        })//this 2 line of code only for one device logout
        console.log(req.user);
        res.clearCookie("jwt")//for deleting cookie
        console.log("logout successfully");
        await req.user.save();
        res.render("login");//logout hotay hi login ka page samnay a jai
        
    } catch (error) {
        res.status(500).send(error)
    }
   
});
app.get("/logouts",auth,async(req,res)=>{
    try {
        req.user.tokens=[];//it means jitnay bi token paray ha array may saray delete krdo jb saray token delete hojai ga har kisi bi device say logout hojai ga
        // console.log(req.user);
        res.clearCookie("jwt")//for deleting cookie
        res.end();//to avoid web request hanging
        console.log("logout successfully");
        await req.user.save();
        res.render("login");//logout hotay hi login ka page samnay a jai
        
    } catch (error) {
        res.status(500).send(error)
    }
   
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
       console.log("the frst part succes is"+registeruser);
      //after getting data from user than ham nay save ni krna data db may us say pahlay hamay password ko hash krna ha is ka code ha yeh
      //this code also called middleware because it works btw 2 codes 
      //ham nay schemea file kay andr aik function declare kra dia ha wo pre ha mtlb kay save krnay say pahlay wo function call hoga aur us ko yha call krnanay ki zrorat ni ha wo automaticallu pre word ki waja say save say pahlay call hojai ga 
      const token= await registeruser.generateusertoken(); //function calling
      console.log("Token part is "+token);
    
        //getting link token with cookie
        res.cookie("jwt",token,{//frst paramenters shows cookie name (write your own choice),second parameters get token number that generated by user
  //expires:new Date(Date.now()+50000000),//it meeans kay jaisay hi user login ya register ho tu token generate hoga tu usi waqt aik date generate hogi us data kay exact 30 sec baad cookie expire hojai gi
        httpOnly:true//it means kay client ya user jwt cookie ko char char ni kr skta without this code user can easily remove cookie by just clicking remove button
});
        console.log("cookie stored"+cookie);
      const registered=await registeruser.save();
        console.log("the page part is "+registered);
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
         console.log("the login token is"+token);
      //getting link token with cookie
          res.cookie("jwt",token,{//frst paramenters shows cookie name (write your own choice),second parameters get token number that generated by user
            expires:new Date(Date.now()+5000000),//time in millisecond //it meeans kay jaisay hi user login ya register ho tu token generate hoga tu usi waqt aik date generate hogi us data kay exact 30 sec baad cookie expire hojai gi
                  httpOnly:true,//it means kay client ya user jwt cookie ko char char ni kr skta without this code user can easily remove cookie by just clicking remove button
         //secure:true//it works only for secure protocal we dont have any protocol
                });
    
        if(!ismatch){//second pass jo user nay enter kia ha aur useremail.password mtlb db kay andr ka password
           
            res.status(400).send("Password not matched please ennter correct password")
        } else{
            res.status(200).render("index");
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