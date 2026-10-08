import { signupSchema } from "../modules/usermodule/user.validation.js"

 import { err } from "../utils/errorhandle.js"

export const validation = (schema)=>{
   return (req,res,next)=>{
    let validationerrors=[]
    Object.keys(schema).map((ele)=>{
        const validator = schema[ele].safeParse(req[ele])
        if(!validator.success){
            validationerrors.push(validator.error.issues)
        }
    })
    if(validationerrors.length){
        err("validation error",400,validationerrors)
    }
    next()
   }
}