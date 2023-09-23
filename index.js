                                              /*        NODE JS         */

// import http from "http"

// // import  gfName from  "./features.js";    
// // import {gfName2,gfName3} from "./features.js"  //Name must be same as those in the file
// // // import  ChamfuckChacha from  "./features.js";   // This will still give MrsRandom as our deafault value is set so no need for same Name
// // // import gfName,{gfName2,gfName3} from  "./features.js";  This works too

// // console.log(gfName);
// // console.log(ChamfuckChacha);

// // import * as myobj from "./features.js"
// // console.log(myobj.gfName2)


// import { generatePercentage } from "./features2.js"
// // console.log(generatePercentage());                     //We can also call it in about section to showup on Web

// import fs from "fs"   //This is a defauult/predefined Import 

// const home = fs.readFileSync("./index.html");//We used Sync so that until this file is Read other functions not Execute Do this or directlty write code to read within your desired section

// //We have created a Server
// const server = http.createServer((req,res)=>{     //1st is always request and 2nd is Response

//     if(req.url === "/")
//     {
//         // fs.readFile("./index.html",(err,home)=>{
//         //     res.end(home);
//         // })

//         res.end(home);
//     }

//     else if(req.url === "/about")
//     {
//         res.end(`<h1>Your love is ${generatePercentage()} pure </h1>`);
//     }

//     else if(req.url === "/contact")
//     {
//         res.end("<h1>This is the Contact Page</h1>");
//     }
//     else
//     {
//         res.end("<h1>Page Not Found</h1>");
//     }

// });

// server.listen(5000,()=>{             //5000 is the http port num---> localhost:5000
//     console.log("Server is Working");
// })










//                                             /*        EXPRESS JS         */

// import express from "express"
// import path from "path"

// const app = express();

                                    
// //Inside '/' HOME we create a function
// app.get("/",(req,res)=>{          

//     // res.send("Hi");       //Simple print Hi
//     // res.sendStatus(404);  //404 is Code for "Not found"
//     // res.status(400).send("Meri Marzi");  //We can set a status directly too-->check for error in console

//     // res.json({
//     //     success:true,
//     //     products:[],
//     // })

//     const pathlocation = path.resolve();                      //set path of our created func inside a variable named 'pathlocation'
//     res.sendFile(path.join(pathlocation,"./index.html"));    //send our file content to the path is our get fucntion
// })

//  app.listen(5000,()=>{
//     console.log("Server is Running...");
// });









                                            /*      EJS          */
//-->Start reading apis/functions from bottom of code it will make sense as above functions are called in below functions                                            
import express from "express";
import mongoose from "mongoose";
import path from "path"
import cookieParser from "cookie-parser";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

//Connecting to DataBase
mongoose.connect("mongodb://localhost:27017",{   //This url we get from MongoDB Compass
    dbName:"backend",
})
.then(()=>console.log("database connected"))
.catch((e)=>console.log(e)) //e is error

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});
const User = mongoose.model("User",userSchema);

const app = express();

//Using Middleware
app.use(express.static(path.join(path.resolve(),"public"))); //We made the 'public' folder static i.e we can directly acess its files in URL-->http://localhost:5000/index.html like this or by using sendFileor if something like a path is not specified while linking file within public it wont show error
app.use(express.urlencoded({extended:true}));  //To acess Data in the form here
app.use(cookieParser());
//Setting up View Engine
app.set("view engine","ejs");


const isAuthenticated =async(req,res,next)=>{ //Destructuring to replace writing ---> ({req.cookies.token}) in below brackets
    const {token} = req.cookies;    
    if(token)    //if token exists 
    {
        const decoded = jwt.verify(token,"ascsdfefdsvsdvsdvsd"); //Decode hashed id from token 

        req.user = await User.findById(decoded._id);       //If Id matches save user info

        next();  //then go to execute next fucntion --> which is to head to logout page
    }
    else
    {
        res.redirect("/login");
    }
}

app.get("/",isAuthenticated,(req,res)=>{    // If cookie exists & ID matches then only this function will be executed
    res.render("logout",{name:req.user.name});
});

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res)=>{   
    res.render("register");
});

app.post("/login",async(req,res)=>{
    const {email,password} = req.body;

    let user = await User.findOne({email});    //match the emails to check if its there in DB or not

    if(!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password,user.password);   //compare user entered password and hashed password

    if(!isMatch) return res.render("login",{message:"Incorrect Password"});

    const token = jwt.sign({_id:user._id},"ascsdfefdsvsdvsdvsd");   //Its ID hashing we provide a random key(random letters) to hash

    res.cookie("token",token,{  //On logging-In a cookie will be generated with name "token" and a users ID stored in const token
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)  //cookie expires in 1min
    });    
    res.redirect("/");              //Then redirected back to home page where logout page is there now

})

app.post("/register",async(req,res)=>{    //We user post method for login as we have SENSITIVE INFO to be entered here
    const {name,email,password} = req.body;
    
    let user = await User.findOne({email})
    if(user)
    {
        return res.redirect("/login")  //if user exist we redirect to Login page
    }

    const hashedPassword = await bcrypt.hash(password,10); //Hashed password

    user = await User.create({    //we get an id of user while creating one -->which we store in const user
        name,
        email,
        password:hashedPassword,
    })

    const token = jwt.sign({_id:user._id},"ascsdfefdsvsdvsdvsd");   //Its ID hashing we provide a random key(random letters) to hash

    res.cookie("token",token,{  //On logging-In a cookie will be generated with name "token" and a users ID stored in const token
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)  //cookie expires in 1min
    });    
    res.redirect("/");              //Then redirected back to home page where logout page is there now
})

app.get("/logout",(req,res)=>{     //We user get method for logout as we dont have any sensitve info to be entered here
    res.cookie("token","iamin",{  
        httpOnly:true,
        expires:new Date(Date.now()), //expires instantly once logged out  
    });    
    res.redirect("/");          
})



app.listen(5000,()=>{
    console.log("Server is Working");
});