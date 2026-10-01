import { Router } from "express";
import * as all from "./service.js";
// import { usermodel } from "../../db/models/usermodel.js";
import { success } from "../../utils/successresponse.js";
// import { auth } from "../../middlewares/auth.js";
import { decodetoken } from "./service.js";
const userrouter = Router()
export const routes = {base:"/user",create:"/create",login:"/login",me:"/me",refresh:"/refreshtoken"}
userrouter.post(routes.create,async(req,res)=>{
    const data = await all.signup(req.body)
    success({
        res,
        status:201,
        data
    })
})
userrouter.post(routes.login,async(req,res)=>{
    const data = await all.login(req.body)
    success({
        res,status:200,data
    })
})
//profile
userrouter.get(routes.me , async(req,res)=>{
    const user = await decodetoken({authorization:req.headers.authorization})
    success({res,status:200,data:user})
})
//not logic to put here the auth middleware ! (reminder)
userrouter.get(routes.refresh,async(req,res)=>{
   const access =await all.refresh(req.headers.authorization)
    success({res,status:200,data:access})
})
export default userrouter