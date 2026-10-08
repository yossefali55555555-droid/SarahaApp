export const err = (errmessage,errcode,options) =>{
    throw new Error(errmessage,{cause:{
        code:errcode,
        options:options
    }});
    
}