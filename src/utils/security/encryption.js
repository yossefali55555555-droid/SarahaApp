import crypto from "crypto"
const secretkey = Buffer.from("12345678901234567890123456789012")
export const encryption = (data)=>{
    const iv =crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc",secretkey,iv)
    let cipherText = cipher.update(data,"utf8","hex")
    cipherText+=cipher.final("hex")
    return  `${iv.toString("hex")}:${cipherText}`
}


export const decryption = (encrypteddata)=>{
    const [iv,enc]=encrypteddata.split(":")
    let iv1 = Buffer.from(iv,"hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc",secretkey,iv1)
    let plaintext = decipher.update(enc,"hex","utf8")
    plaintext+=decipher.final("utf8")
    return plaintext
}