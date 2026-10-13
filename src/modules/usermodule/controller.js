import { Router } from "express";
import * as all from "./service.js";
import { success } from "../../utils/successresponse.js";
import { auth } from "../../middlewares/auth.js";
import { authorization } from "../../middlewares/auth.js";
import { roleenum } from "./user.types.js";
import { validation } from "../../middlewares/validation.js";
import { signupSchema } from "./user.validation.js";
import { ro } from "zod/locales";
const userrouter = Router()
export const routes = {base:"/user",create:"/create",login:"/login",me:"/me",refresh:"/refreshtoken",gmail:"/signup/gmail",confirmed:"/confirm"}
userrouter.post(routes.create,validation(signupSchema),async(req,res)=>{
    const data = await all.signup(req.body)
    success({res,status:200,data})
})
userrouter.post(routes.login,async(req,res)=>{
    const data = await all.login(req.body)
    success({res,status:200,data})
})
userrouter.get(routes.me,auth,authorization(roleenum.user),async(req,res)=>{
    const user = req.user
    success({res,status:200,data:user})
})
userrouter.get(routes.refresh,async(req,res)=>{
    const data = await all.refresh(req.headers.authorization)
    success({res,status:200,data})
})

userrouter.post(routes.gmail,async(req,res)=>{
    const data = await all.gmaillogin(req.body.idToken)
       success({
        res,
        status: 200,
        data: data
    })
})
userrouter.patch(routes.confirmed,async(req,res)=>{
    const {otp,email} = req.body
    const data = await all.confirmed(otp,email)
     success({res,status:200,data})
})
export default userrouter