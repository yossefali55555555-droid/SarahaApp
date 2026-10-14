import z from "zod"
import { genderenum } from "./user.types.js"
export const signupSchema = {
    body:z.strictObject({
    fullname:z.string(),
    password : z.string(),
    phone : z.string().min(10).max(20).optional(),
    email:z.email(),
    gender:z.enum(genderenum),
    username:z.string(),
    confirmedPassword:z.string()
}).refine((arg)=>{
    return arg.password==arg.confirmedPassword,{error:"password missmatch",
        path:["password","confirmedPassword"]
    }
})
}