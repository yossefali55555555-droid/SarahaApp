import multer, { diskStorage } from "multer"
import fs from "fs/promises"


export const uploadfile =(dest="./uploads")=>{
    const storage = diskStorage({
        destination:async(req,file,cb)=>{
            const user_id = req.user._id
            const folder_name = `./uploads${dest}_${user_id}`
            try{
            await fs.access(folder_name)  //وظيفتها بتخش جوا فايل لو دخل و لقي مش هيوقع  السيرفر
            }
            catch(err){
                await fs.mkdir(folder_name,{
                    recursive:true
                })
            }
            cb(null,folder_name)  
        },
        filename:  (req,file,cb)=>{  //cb (err,filname)
            const username = req.user.username
            const filename = username + "_" + Date.now()+ "_" + file.originalname
            cb (null,filename)
        }
    })
    

    
    
    
    return multer({
        storage
    })
}