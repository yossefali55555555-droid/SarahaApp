import { model, Schema, Types } from "mongoose";
import { object } from "zod";
import { required } from "zod/mini";


const messageSchema = new Schema ({
    content:{
        type:String,
        required:function(){return this.images?.length ?false :true}
    },
    images:{
        type:[String]
    },
    to:{
        type:Types.ObjectId,
        required:true,
        ref:"users"
    }
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
    }})


    export const messagemodel = model("messages",messageSchema)