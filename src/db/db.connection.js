import mongoose from "mongoose";
export const dbcon = async()=>{
    try {   
        await mongoose.connect(process.env.db_url)
        console.log("database connected")
    }
    catch (err){
        console.log(err)
    }
}