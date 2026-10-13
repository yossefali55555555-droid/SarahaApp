import jwt from "jsonwebtoken"
import { usermodel } from "../../db/models/usermodel.js"
import { decodetoken } from "../../middlewares/auth.js"
import { err } from "../../utils/errorhandle.js"
import { createhash, ismatch } from "../../utils/security/hash.js"
import { providerenum, tokenenum } from "./user.types.js"
import { OAuth2Client } from "google-auth-library"
import { random1 } from "../../utils/email/createOTP.js"
import { sendemail } from "../../utils/email/sendemail.js"
import { emailTemplate } from "../../utils/email/emailTemplate.js"
const client  = new OAuth2Client()
export const signup = async({username,fullname,email,password,phone})=>{
    const user = await usermodel.findOne({$or:[
        {email},
        {username}
    ]})
    if (user){
        err(`${user.username ?"username":"email"} is exists`)
    }
        const otp = random1()
        await sendemail(email,"Verify Your Email",emailTemplate({otp,subject:"Verify Your Email"}))
        const hashedpassword = await createhash(password)
        const data = await usermodel.insertOne({username,fullname,email,otp:{
            otp
        },password:hashedpassword,phone})
        return data
    
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


export const gmaillogin=async(token)=>{
    const ticket = await client.verifyIdToken({
        idToken:token,
        audience:process.env.client_id
    }) //فكينا توكين كلها 
    const {name,email,picture} = await ticket.getPayload() //الداتا فعلا الي جوا بتاعى اليوزر
    let user = await usermodel.findOne({email})
    if(user){
    if(user.provider!==providerenum.google){
        err("please signup with your provider",400)
    }
}

else{
    user = await usermodel.create({
        email,
        fullname:name,
        profileimage:picture,
        provider:providerenum.google
    })
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


export const confirmed = async(otp,email)=>{
    const user = await usermodel.findOne({email,confirmedAt:{
        $exists:false
    }})
    if(!user)
    {
        err("user not found ",404)
    }
    if(!user.otp||user.otp.expiresIn<Date.now()){
        err("otp expired ",404)
    }
    if(user.otp.otp!==otp){
        err("invalid",404)
    }
    user.confirmedAt=Date.now()
    await user.save()
    return user
}