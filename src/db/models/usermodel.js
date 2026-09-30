import { model, Schema } from "mongoose";
import { genderenum, providerenum, roleenum } from "../../modules/usermodule/user.types.js";

const usersch = new Schema ({
    username:{
        type:String,
        required:true,
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
        required:true
    },
    age : Number,
    profileimage:{
        type:String
    },
    gender:{
        type:Number,
        enum :Object.values(genderenum)
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
    }
},{timestamps:true,strict :true,strictQuery:true,optimisticConcurrency:true,toJSON:{
    virtuals:true,
    getters:true,
    transform(doc,ret){
        delete ret.password;
        delete ret.id;
        return ret;
    }
},virtuals:{
    fullname:{
        get (){
            return this.firstname + " " + this.lastname
        }
        ,set(value){
            const [firstname,lastname] = value.split(" ")
            if(!firstname||!lastname){
                throw new Error("should type first or last name")
            }
            this.set("firstname",firstname)
            this.set("lastname",lastname)
        }
    }
}})


export const usermodel = model ("users",usersch)