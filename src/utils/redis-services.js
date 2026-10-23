export const userprefix = (userid) =>`users:${userid}:otp`
export const confirmemailkey  = (userid) =>`${userprefix(userid)}:confirmemail`
export const resend = (userid) => `${userprefix(userid)}:resend`
export const attemps = (userid) =>`${userprefix(userid)}:attemps` 
export const block = (userid) =>`${userprefix(userid)}:block`
export const blockcount = (userid) =>`${userprefix(userid)}:blockcount`