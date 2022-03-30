const mongoose = require("mongoose");
const bcrypt=require("bcryptjs");
const async = require("hbs/lib/async");
const jwt=require("jsonwebtoken");
const res = require("express/lib/response");
const userschema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phoneno: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

//for generating user token

//method srf instance ko use krnay k liay hota ha ku kay pichay jha say calling ai ha wha wo khud instance ha (registeruser) is liay method use kia 
userschema.methods.generateusertoken= async function(){
    try {
        // console.log(this._id);
        const token=jwt.sign({_id:this._id.toString()},process.env.secret_key);//secret key is liay likha ta kay github may koi dekh na skay yeh .env file may secret kley
        //concat jorna 
        //for adding token into database
        this.tokens=this.tokens.concat({token:token});
        await this.save();//for saving token into database
        return token;
    } catch (error) {
        res.send("error part"+error);
        console.log("error part"+error);
    }
}
//it means kay jaisay paper danay say pahlay hall may enter honay say pahlay hamari checking hoti ha isi tara user ka data lia mtlb paper prepare kr lia ab ham nay wo data db may store krnay say pahlay aik function call krna ha jismay wo password ko hash krday ga mtlb hamari checking hogi 
userschema.pre("save", async function (next) {
    if (this.isModified("password")) {//is modified is use kay ager user already register ha lkin wo pass update krna chahta ha tu fr bi yhi function call hoga aur jo new pass hoga wo hash hokay db may store hojai ga 
       // const passwordhash = await bcrypt.hash(password, 10);//password jo user nay enter kia ha 10 mtlb salt mtlb kitna salt dalna ha pass may by default 10 hota ha agr 12 kro gay tu time lay ga database may store krtay waqt lkin agr 10 say nichay likho gay tu fr hacker ko kam time may pass hack krlay ga 
      //  console.log(`user entered pass is ${this.password}`);this mtlb jo user currently pass fill kr rha ha 
        this.password = await bcrypt.hash(this.password, 10);
       // console.log(`user hash pass is ${this.password}`);
        this.confirmpassword=await bcrypt.hash(this.password, 10);//hamay cnfrm pass srf user ko check krnay k liay kia ta kay user pass sai enter kr rha ha ya ni database say is ka koi lena dena ni is liay undefined kr dia ta kay database may show na hu
    }
    next();//next keyword mtlb kay pass hash krnay kay baad kia krna ha stop krna ha ya data store krna ha db may
})
const Register = new mongoose.model("UserRegister", userschema);
module.exports = Register;