import { Router } from "express";
import * as all from "./service.js";
// import { usermodel } from "../../db/models/usermodel.js";
import { success } from "../../utils/successresponse.js";
const userrouter = Router()
export default userrouter
export const routes = {base:"/user",get:"/get/:id",delete:"/del/",update:"/update/:id",create:"/create",login:"/login"}
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