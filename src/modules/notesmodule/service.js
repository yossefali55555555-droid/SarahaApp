import { messagemodel } from "../../db/models/messages.js"
import { usermodel } from "../../db/models/usermodel.js"
import { err } from "../../utils/errorhandle.js"

export const sendmessage = async(content,images,to)=>{
     const to1 = await usermodel.findById(to)
    if(!to1){
        err("user not found",404)
    }
    const message = await messagemodel.create({
        content,
        images,
        to
    })
    return message
}