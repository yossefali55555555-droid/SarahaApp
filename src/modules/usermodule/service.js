import { usermodel } from "../../db/models/usermodel.js"
import { err } from "../../utils/errorhandle.js"
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
    const token = jwt.sign({email:find.email,_id:find._id},"ajflksjafdl;kj")
    return token
}