export const success = async({res,status,msg,data})=>{
        res.status(status).json({
            msg:msg,
            status:status,
            data:data
        })
}