import { model, Schema } from "mongoose";
import { genderenum, providerenum, roleenum } from "../../modules/usermodule/user.types.js";
import { decryption, encryption } from "../../utils/security/encryption.js";


// const otpshcema =new Schema( {
//         otp:{
//             required:true,
//             type:String
//         },
//         expiresIn:{
//             type:Date,
//              default: () => new Date(Date.now() + 5 * 60 * 1000)
//         }
//     },{
//         _id:false
//     })
//     otpshcema.index("expiresIn",{ //اول ما التاريخ يجي امسحه
//         expireAfterSeconds:0
//     })
const usersch = new Schema ({
    username:{
        type:String,
         required:function(){
            this.provider == providerenum.system ? true :false;
        },
        unique:true
    } 
    ,firstname :{
        type:String,
        required:true
    },
      lastname :{
        type:String,
        required:true
    },
        email :{
        type:String,
        required:true,
        unique:true
    }
    ,
      password :{
        type:String,
        required:function(){
            this.provider == providerenum.system ? true :false;
        }
    },
    age : Number,
    profileimage:{
        type:String
    },
    gender:{
        type:Number,
        enum :Object.values(genderenum),
        default:genderenum.male
    },
    provider : {
        type:Number,
        enum: Object.values(providerenum),
        default:providerenum.system
    },
    role:{
        type:Number,
        enum : Object.values(roleenum),
        default : roleenum.user
    },
    bio :{
        type:String
    },
    confirmedAt:{
        type:Date
    },
    blockedAt:Date,
    phone:{
        type:String,
        set (value) {
            return encryption(value)
        },
        get(value){
            return decryption(value)
        }
    },
    // otp:otpshcema
},{
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,

    toJSON: {
        virtuals: true,
        getters: true,
        transform(doc, ret) {
            delete ret.password;
            delete ret.id;
            return ret;
        }
    },

    toObject: {
        virtuals: true,
        getters: true
    },

    virtuals: {
        fullname: {
            set(value) {
                const [firstname, lastname] = value.split(" ");

                if (!firstname || !lastname) {
                    throw new Error("should type first or last name");
                }

                this.set("firstname", firstname);
                this.set("lastname", lastname);
            }
        }
    }
})


export const usermodel = model ("users",usersch)