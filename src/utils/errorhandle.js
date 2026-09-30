export const err = (errmessage,errcode) =>{
    throw new Error(errmessage,{cause:{
        code:errcode
    }});
    
}