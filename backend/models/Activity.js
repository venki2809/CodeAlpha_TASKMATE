import mongoose from 'mongoose';
const schema = new mongoose.Schema({id:{type:String,required:true,unique:true},actorId:String,projectId:String,taskId:String,type:String,message:String,createdAt:String,order:Number},{versionKey:false,id:false});
export default mongoose.model('Activity',schema);
