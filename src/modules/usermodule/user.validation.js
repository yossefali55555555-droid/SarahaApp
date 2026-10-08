import z, { strictObject, string } from "zod"
import { genderenum } from "./user.types.js"
export const signupSchema = {
    body:strictObject({
    fullname:z.string(),
    password : z.string(),
    phone : z.string().min(10).max(20).optional(),
    email:z.email(),
    gender:z.enum(genderenum),
    username:z.string()
}),query:strictObject({
    id:z.object().optional()
})

}