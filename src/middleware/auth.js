const jwt=require("jsonwebtoken");
const async = require("hbs/lib/async");
const Register=require("../models/schema");//resgister shows database collection name
const auth=async(req,res,next)=>{
 try {
     const token=req.cookies.jwt;
     const verify=jwt.verify(token,process.env.secret_key);//it means kay jo token user login kay doran gebnerate kray ga us ko cookie kay token say match krwao aur fr usko token var may store krwa do
     console.log(verify);
     const user=await Register.findOne({_id:verify._id});//frst id database id second is verification kay baad jo id approve hoi ha us id ko 
     console.log(user.fullname);//user.fullname say hamay documnets say srf uska name millay ga rather than whole documents
     req.token=token;
     req.user=user;
     next();

 } catch (error) {
     console.log("Error"+error);
     res.status(401).send(error);
 }
}
module.exports=auth;