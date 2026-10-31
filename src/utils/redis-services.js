export const userprefix = (userid) =>`users:${userid}:otp`
export const confirmemailkey  = (userid) =>`${userprefix(userid)}:confirmemail`
export const resend = (userid) => `${userprefix(userid)}:resend`
export const attemps = (userid) =>`${userprefix(userid)}:attemps` 
export const block = (userid) =>`${userprefix(userid)}:block`
export const blockcount = (userid) =>`${userprefix(userid)}:blockcount`


//for forget password
export const userprefix2 = (userid) =>`users:${userid}:forget`
export const  confirmemailkey2 = (userid) =>`${userprefix2(userid)}:confirmemail`
export const resend2 = (userid) => `${userprefix2(userid)}:resend`
export const attemps2 = (userid) =>`${userprefix2(userid)}:attemps` 
export const block2 = (userid) =>`${userprefix2(userid)}:block`
export const blockcount2 = (userid) =>`${userprefix2(userid)}:blockcount`


//for  jti
export const sessionperfix= (userid)=>{
    return `users:${userid}:session`
}
export const session= (userid,jti)=>{
    return `${sessionperfix(userid)}:${jti}`
}