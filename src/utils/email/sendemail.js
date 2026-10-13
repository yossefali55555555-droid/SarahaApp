import nodemailer from "nodemailer"

export const sendemail = async(to,subject,html)=>{
    const transporter = nodemailer.createTransport({
        auth:{
            user : "yossefali55555555@gmail.com",
            pass :"gaok nean sipx fpfq"
        },
        service:"gmail"
    })
    await transporter.sendMail({
        from:"yossefali55555555@gmail.com",
        to:to,  
        subject:subject,
        html:html
    })
}