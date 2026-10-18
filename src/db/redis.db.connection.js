import { createClient } from "redis";
export const rediscon= createClient({
    url:process.env.redis,
    database:1
})

rediscon.on("error",(err)=>console.log("error in redis is " + err))
rediscon.on("connect",()=>console.log("redis connected"))