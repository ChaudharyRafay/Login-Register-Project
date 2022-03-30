const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/registerformdatabase",{
    useNewUrlParser:true,    //this 3 flag avoid depricated error
    useUnifiedTopology:true,
    // useCreateIndex:true
})
.then(()=>{  //if connection successful is k liay then use hoa ha
console.log("Connection successfull")
})
.catch((err)=>{ // if some error during connection use catch
console.log("No Connection Followings are the error",err);
})