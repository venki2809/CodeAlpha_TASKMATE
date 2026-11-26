import mongoose from 'mongoose';
const schema = new mongoose.Schema({id:{type:String,required:true,unique:true},userId:String,read:Boolean,message:String,path:String,createdAt:String,order:Number},{versionKey:false,id:false});
export default mongoose.model('Notification',schema);
