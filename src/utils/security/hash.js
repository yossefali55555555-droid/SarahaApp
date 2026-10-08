import argon2 from "argon2"
export const createhash = async(password)=>{
    const generatedhash = await argon2.hash(password,{
        memoryCost:1024*1024 //1MB
    })
    return generatedhash
}
export const ismatch = async(password,dbpassword)=>{
    const data = await argon2.verify(dbpassword,password)
    return data //true or false
}