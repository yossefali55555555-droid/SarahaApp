import userrouter from "../modules/usermodule/controller.js"
import { usermodel } from "../db/models/usermodel.js"
import { routes } from "../modules/usermodule/controller.js"
import jwt from "jsonwebtoken"
import { err } from "../utils/errorhandle.js"
// export const auth = 
// async(req,res,next)=>{
// const user = await decodetoken({authorization:req.headers.authorization})
//    next()
// }

export const tokenenum = {
     access:"access",
     refresh:"refresh"
}

export const decodetoken = async({authorization,tokentype=tokenenum.access})=>{
   if(!authorization||!authorization.startsWith("Bearer")){
    err("invalid token",400)
   }
   const token = authorization.split(" ")[1]
   console.log("token:", token)
   const payload = jwt.verify(token,tokentype==tokenenum.access?process.env.login_secret_token:process.env.refresh_token)
   const user = await usermodel.findOne({_id:payload._id})
   if(!user){
        err("user not found",404)
   }
   return {user}
}