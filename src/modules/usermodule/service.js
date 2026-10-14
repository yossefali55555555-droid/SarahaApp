import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { usermodel } from "../../db/models/usermodel.js"
import { decodetoken } from "../../middlewares/auth.js"
import { random1 } from "../../utils/email/createOTP.js"
import { emailTemplate } from "../../utils/email/emailTemplate.js"
import { sendemail } from "../../utils/email/sendemail.js"
import { err } from "../../utils/errorhandle.js"
import { createhash, ismatch } from "../../utils/security/hash.js"
import { providerenum, tokenenum } from "./user.types.js"
import { email } from "zod"
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
            otp:await createhash(otp)
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
    await chechotp(user,otp)
    user.confirmedAt=Date.now()
    user.otp=undefined
    await user.save()
    return "done"
}


export const forgetPassSendmail = async(email)=>{
    const user = await usermodel.findOne({email})
    if(!user){
       return
    }
    if(user.otp?.expiresIn && user.otp.expiresIn > Date.now()){
        return
    }
    const otp = random1()
    user.otp = {
    otp: await createhash(otp),
    expiresIn: new Date(Date.now() + 5 * 60 * 1000)
};
    await user.save()
    await sendemail(email,"FORGET PASS OTP",emailTemplate({subject:"FORGET PASS OTP",otp}))
    return {data:{}}
}


export const resetpassword= async(email,otp,password)=>{
    const user = await usermodel.findOne({email})
      if(!user)
    {
        err("user not found ",404)
    }
    await chechotp(user,otp)
    user.password = await createhash(password)
    await user.save()
    return {data:{}}
}

export const chechotp =async(user,otp)=>{
    if(!user.otp||user.otp.expiresIn<Date.now()){
        err("otp expired ",404)
    }
    if(!(await ismatch(otp,user.otp.otp))){
        err("invalid",404)
    }
}