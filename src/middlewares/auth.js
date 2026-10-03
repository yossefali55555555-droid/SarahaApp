import { tokenenum } from "../modules/usermodule/user.types.js"
import jwt from "jsonwebtoken"
import { usermodel } from "../db/models/usermodel.js"
export const auth = async(req,res,next)=>{
    const {user}=await decodetoken(req.headers.authorization)
    req.user =user
    next()
}
export const decodetoken =  async(authorization,tokentype=tokenenum.access)=>{
    if(!authorization||!authorization.startsWith("Bearer")){
        err("invalid token",400)
    }
    const token = authorization.split(" ")[1]
    const payload = jwt.verify(token,
        tokentype==tokenenum.access?
        process.env.access
        :process.env.refresh
    )
    const user = await usermodel.findById(payload._id)
    return {user}
}


export const authorization =  (...roles)=>{
    return async(req,res,next)=>{
     if(!roles.includes(req.user.role)){
        err("unauthorized",401)
    }
    next()
    }
}