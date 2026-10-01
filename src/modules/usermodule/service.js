import { usermodel } from "../../db/models/usermodel.js"
import { err } from "../../utils/errorhandle.js"
import { tokenenum } from "./user.types.js"
import jwt from "jsonwebtoken"

export const signup = async({username,fullname,email,password})=>{
    const user = await usermodel.findOne({
        $or:[
            {email:email},
            {username:username}
        ]
    })
    if (user){
        err(`${user.email===email ?"email":"username"} exists`,400)
    }
    const data = await usermodel.create({username,fullname,email,password})
    return data
}   

export const login = async ({identifier,password})=>{
    const find  = await usermodel.findOne({$or:[
        {email:identifier},{username:identifier}
    ]})
    if(!find){
        err("invalid creds" ,400)
    }
    if(find.password!==password){
        err("invalid creds" ,400)
    }
    const accesstoken = jwt.sign({email:find.email,_id:find._id},process.env.login_secret_token,
        {
            expiresIn:"30min"
        }
    )
        const refreshtoken = jwt.sign({email:find.email,_id:find._id},process.env.refresh_token,
        {
            expiresIn:"1day"
        }
    )
    return {data:{accesstoken,
        refreshtoken
    }}
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



export const refresh = async(authorization)=>{
    const {user} = await decodetoken({authorization,tokentype:tokenenum.refresh})
    const access = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.login_secret_token)
return { accesstoken: access }
}


    
