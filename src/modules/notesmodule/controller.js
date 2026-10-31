import { Router } from "express";
import { uploadfile } from "../../utils/multer.js";
import { sendmessage } from "./service.js";
import { success } from "../../utils/successresponse.js";
const messagerouter = Router()
export const messageroutes = {
    base:"/message",
    send:"/send"
}


messagerouter.post(messageroutes.send,uploadfile("/messages").array("images",1),async(req,res)=>{
    const {to,content} =req.body
    const images = req.files.map((ele)=>ele.path)
    const data = await sendmessage(content,images,to)
    success({res,status:200,data})
})









export default messagerouter