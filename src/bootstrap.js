import express from "express"
import { dbcon } from "./db/db.connection.js"
import userrouter, { routes } from "./modules/usermodule/controller.js"
// import noterouter, { notesroutes } from "./modules/notesmodule/controller.js"
import cors from "cors"
import { config } from "dotenv"
import { rediscon } from "./db/redis.db.connection.js"
config({ path: "./src/.env" })
const app = express()
app.use(express.json())
app.use("/uploads",express.static("./uploads"))
app.use(cors({
    origin:"*"
}))
export const bootstrap = async()=>{
    await dbcon()
    await rediscon.connect()
     await rediscon.set("name","yossef")
    const user1=await rediscon.get("name")
    console.log(user1)
    app.use(routes.base,userrouter)
    // app.use(notesroutes.base,noterouter)
    // sendemail("yossefali55555555@gmail.com","hi jo",emailTemplate({otp:124,subject:"hi jo"}))
    app.use((err,req,res,next)=>{
            const code = err.cause?.code || 400
            res.status(code).json({
                msg:err.message,
                status:code,
                ERROptions:err.cause?.options
            })       
    })
    app.listen(process.env.PORT,()=>{
        console.log ("express and http connected")
    })
}