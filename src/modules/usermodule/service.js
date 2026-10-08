import { usermodel } from "../../db/models/usermodel.js"
import { err } from "../../utils/errorhandle.js"
import { success } from "../../utils/successresponse.js"
import jwt from "jsonwebtoken"
import { tokenenum } from "./user.types.js"
import bcrypt from "bcrypt"
import { decodetoken } from "../../middlewares/auth.js"
import { createhash, ismatch } from "../../utils/security/hash.js"
import { encryption } from "../../utils/security/encryption.js"

export const signup = async({username,fullname,email,password,phone})=>{
    const user = await usermodel.findOne({$or:[
        {email},
        {username}
    ]})
    if (user){
        err(`${user.username ?"username":"email"} is exists`)
    }
    if(!user){
        const hashedpassword = await createhash(password)
        const data = await usermodel.insertOne({username,fullname,email,password:hashedpassword,phone:encryption(phone)})
        return data
    }
}


export const login = async ({iden,password})=>{
    const user = await usermodel.findOne({$or:[
        {email:iden},
        {username:iden}
    ]})
      if(!user){
        err("invalid creds" ,404)
    }
    const match = await ismatch(password,user.password)
    if(!match){
          err("invalid creds" ,404)
    }
        const access = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.access,{
        expiresIn:"30min"
    })
         const refresh = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.refresh,{
        expiresIn:"30day"
    })
    return {
        refresh,access
    }
    
}






export const refresh = async (authorization)=>{
    const {user}=await decodetoken(authorization,tokenenum.refresh)
    const access = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.access,{
        expiresIn:"30min"
    })
    return access
}