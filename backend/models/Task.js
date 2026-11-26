import mongoose from 'mongoose';
const comment = new mongoose.Schema({id:String,userId:String,body:String,createdAt:String},{_id:false});
const check = new mongoose.Schema({id:String,text:String,done:Boolean},{_id:false});
const schema = new mongoose.Schema({
  id:{type:String,required:true,unique:true,index:true},
  projectId:{type:String,required:true,index:true},
  title:{type:String,required:true,maxlength:160},
  description:{type:String,default:'',maxlength:4000},
  status:{type:String,enum:['todo','progress','review','done'],default:'todo'},
  priority:{type:String,enum:['low','medium','high','urgent'],default:'medium'},
  assigneeIds:[String],dueDate:{type:String,default:''},tag:{type:String,default:''},
  checklist:[check],comments:[comment],
  createdBy:String,createdAt:String,updatedAt:String,order:{type:Number,default:0}
},{versionKey:false,id:false});
export default mongoose.model('Task',schema);
