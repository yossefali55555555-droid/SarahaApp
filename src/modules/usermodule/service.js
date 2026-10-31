import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { usermodel } from "../../db/models/usermodel.js"
import { rediscon } from "../../db/redis.db.connection.js"
import { decodetoken } from "../../middlewares/auth.js"
import { random1 } from "../../utils/email/createOTP.js"
import { emailTemplate } from "../../utils/email/emailTemplate.js"
import { sendemail } from "../../utils/email/sendemail.js"
import { err } from "../../utils/errorhandle.js"
import { attemps, attemps2, block, block2, blockcount, blockcount2, confirmemailkey, confirmemailkey2, resend, resend2, session, sessionperfix, userprefix ,userprefix2} from "../../utils/redis-services.js"
import { createhash, ismatch } from "../../utils/security/hash.js"
import { providerenum, tokenenum } from "./user.types.js"
import { nanoid } from "nanoid"
const client  = new OAuth2Client()


export const bcounts =(count)=>{
    const blockmin= [5,15,60,300,1440]
    const index = Math.min(count,blockmin.length) 
    return  blockmin[index] *60
}







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
        const data = await usermodel.insertOne({username,fullname,email
        ,password:hashedpassword,phone})
         await rediscon.set(confirmemailkey(data._id),await createhash(otp),{
            expiration:{
                type:"EX",
                value:5*60
            }
         })
         await rediscon.set(resend(data._id),0,{
            expiration:{
                type:"EX",
                value:60
            }
         })
         await rediscon.incr(attemps(data._id))
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
    const jwtid = nanoid()
        const access = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.access,{
        expiresIn:"30min",
        jwtid
    })
         const refresh = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.refresh,{
        expiresIn:"7day",
        jwtid
    })
    await rediscon.set(session(user._id,jwtid),jwtid,{
        expiration:{
            type:"EX",
            value:7*24*60*60
        }
    })
    return {
        refresh,access
    }
    
}






export const refresh = async (authorization)=>{
    const {user,jti}=await decodetoken(authorization,tokenenum.refresh)
    const access = jwt.sign({
            _id:user._id,
            email:user.email
        },
    process.env.access,{
        expiresIn:"30min",
        jwtid:jti
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

export const resendconfirmemail = async(email)=>{
    const user = await usermodel.findOne({email,confirmedAt:{
        $exists:false
    }})
    if(!user){
        err("user not found",404)
    }
    const cannotresend= await rediscon.get(resend(user._id))
    ||await rediscon.get(block(user._id))
    if(cannotresend){
        err("wait shwya ",400)
    }
      const attemptsCount =await rediscon.incr(attemps(user._id))
        if (attemptsCount >=5){
            const blocKcount = await rediscon.incr(blockcount(user._id))
            await rediscon.set(block(user._id),0,{
                expiration:{
                    type:"EX",
                    value:bcounts(blocKcount)
                }
            })
            await rediscon.set(attemps(user._id),0)
        }
        else{
         await rediscon.set(resend(user._id),0,{
            expiration:{
                type:"EX",
                value:60
            }
         })
        }
        const otp = random1()
        await sendemail(email,"Verify Your Email",emailTemplate({otp,subject:"Verify Your Email"}))
        await rediscon.set(confirmemailkey(user._id),await createhash(otp),{
            expiration:{
                type:"EX",
                value:5*60
            }
         })
         return {data:{}}
    }
export const confirmed = async(otp,email)=>{
    const user = await usermodel.findOne({email,confirmedAt:{
        $exists:false
    }})
      if(!user)
    {
        err("user not found ",404)
    }
    const dbotp = await  rediscon.get(confirmemailkey(user._id))
    if(!dbotp){
        err("invalid or expired otp",404)
    }
    const isblocked= await rediscon.get(block(user._id))
    if(isblocked){
        const blockedttl= await rediscon.ttl(block(user._id))
        err(`you are restricted until ${Math.ceil(blockedttl/60)}`,401)
    }
    const otpcorrect  = await ismatch(otp,dbotp)
    if(!otpcorrect){
        const attemptsCount =await rediscon.incr(attemps(user._id))
        if (attemptsCount >=5){
            const blocKcount = await rediscon.incr(blockcount(user._id))
            const durationMinutes = bcounts(blocKcount) / 60;
            await rediscon.set(block(user._id),0,{
                expiration:{
                    type:"EX",
                    value:bcounts(blocKcount)
                }
            })
            await rediscon.set(attemps(user._id),0)
            err(`you are restricted until the block ${durationMinutes} minutes remaining`,401)
        }
           err("Invalid OTP", 400);
    }
    else{
        user.confirmedAt=Date.now()
        await user.save()
        const userkeys=await rediscon.keys(`${userprefix(user._id)}*`)
             await rediscon.del(userkeys)
    }
    return "done"
}


export const forgetPassSendmail = async(email)=>{
    const user = await usermodel.findOne({email})
    if(!user){
       return
    }
    const isotp= await rediscon.get(confirmemailkey2(user._id))
    if(isotp){
        return "you still have otp"
    }
     const cannotresend= await rediscon.get(resend2(user._id))
    ||await rediscon.get(block2(user._id))
    if(cannotresend){
        err("wait shwya ",400)
    }
    const attemptsCount =await rediscon.incr(attemps2(user._id))
        if (attemptsCount >=5){
            const blocKcount = await rediscon.incr(blockcount2(user._id))
            await rediscon.set(block2(user._id),0,{
                expiration:{
                    type:"EX",
                    value:bcounts(blocKcount)
                }
            })
            await rediscon.set(attemps2(user._id),0)
              err("Too many attempts", 401);
        }
           else{
         await rediscon.set(resend2(user._id),0,{
            expiration:{
                type:"EX",
                value:60
            }
         })
        const otp = random1()
        await rediscon.set(confirmemailkey2(user._id),await createhash(otp),{
            expiration:{
                type:"EX",
                value:5*60
            }
         })
    await sendemail(email,"FORGET PASS OTP",emailTemplate({subject:"FORGET PASS OTP",otp}))
    return {data:{}}
        }
}


export const resetpassword= async(email,otp,password)=>{
    const user = await usermodel.findOne({email})
      if(!user)
    {
        err("user not found ",404)
    }
     const dbotp = await  rediscon.get(confirmemailkey2(user._id))
    if(!dbotp){
        err("invalid or expired otp",404)
    }
    const isblocked= await rediscon.get(block2(user._id))
    if(isblocked){
        const blockedttl= await rediscon.ttl(block2(user._id))
        err(`you are restricted until ${Math.ceil(blockedttl/60)}`,401)
    }
    const otpcorrect  = await ismatch(otp,dbotp)
    if(!otpcorrect){
        const attemptsCount =await rediscon.incr(attemps2(user._id))
        if (attemptsCount >=5){
            const blocKcount = await rediscon.incr(blockcount2(user._id))
            const durationMinutes = bcounts(blocKcount) / 60;
            await rediscon.set(block2(user._id),0,{
                expiration:{
                    type:"EX",
                    value:bcounts(blocKcount)
                }
            })
            await rediscon.set(attemps2(user._id),0)
            err(`you are restricted until the block ${durationMinutes} minutes remaining`,401)
        }
           err("Invalid OTP", 400);
    }
    else{
    user.password = await createhash(password)
    await user.save()
    const userkeys=await rediscon.keys(`${userprefix2(user._id)}*`)
    await rediscon.del(userkeys)
    return {data:{}}    
}
}

export const logout1 = async(userid,jti)=>{
    const user= await usermodel.findById(userid)
    if(!user){
        err("user not found ",404)
    }
    const redisSession = await rediscon.del(session(userid,jti))
    if(redisSession<1){
        err("you are alerdy logged out",400)
    }
    return "logout done ^^"
}

export const logoutall = async(userid)=>{
    const user= await usermodel.findById(userid)
    if(!user){
        err("user not found ",404)
    }
    const redisSession = await rediscon.keys(`${sessionperfix(userid)}*`)
    const deleteall = await rediscon.del(redisSession)
    if(deleteall<1){
        err("you are alerdy logged out",400)
    }
    return "logout done ^^"
}
// export const chechotp =async(user,otp)=>{
//     if(!user.otp||user.otp.expiresIn<Date.now()){
//         err("otp expired ",404)
//     }
//     if(!(await ismatch(otp,user.otp.otp))){
//         err("invalid",404)
//     }
// }