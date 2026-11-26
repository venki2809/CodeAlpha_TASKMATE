import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  id:{type:String,required:true,unique:true,index:true},
  name:{type:String,required:true,maxlength:80},
  key:{type:String,required:true,maxlength:15},
  description:{type:String,default:'',maxlength:400},
  color:{type:String,default:'#5979e9'},
  status:{type:String,enum:['active','completed'],default:'active'},
  ownerId:{type:String,required:true},
  memberIds:[String],
  createdAt:{type:String,required:true},
  order:{type:Number,default:0}
},{versionKey:false,id:false});
export default mongoose.model('Project',schema);
