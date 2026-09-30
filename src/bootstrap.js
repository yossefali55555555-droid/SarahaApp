import express from "express"
import { dbcon } from "./db/db.connection.js"
import userrouter, { routes } from "./modules/usermodule/controller.js"
// import noterouter, { notesroutes } from "./modules/notesmodule/controller.js"

const app = express()
app.use(express.json())
export const bootstrap = async()=>{
    await dbcon()
    app.use(routes.base,userrouter)
    // app.use(notesroutes.base,noterouter)
    app.use((err,req,res,next)=>{
            const code = err.cause?.code || 400
            res.status(code).json({
                msg:err.message,
                status:code
            })       
    })
    app.listen(3000,()=>{
        console.log ("express and http connected")
    })
}