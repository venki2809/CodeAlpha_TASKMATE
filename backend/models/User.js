import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  id: {type:String,required:true,unique:true,index:true},
  name: {type:String,required:true,trim:true,maxlength:70},
  email: {type:String,required:true,lowercase:true,trim:true,unique:true,index:true},
  passwordHash: {type:String,select:false,default:null},
  role: {type:String,enum:['Admin','Member'],default:'Member'},
  title: {type:String,default:'Team Member',maxlength:90},
  color: {type:String,default:'#dbe8f6'},
  order: {type:Number,default:0},
}, {versionKey:false,id:false});
export default mongoose.model('User',schema);
