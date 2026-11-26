import mongoose from 'mongoose';
const schema = new mongoose.Schema({slug:{type:String,default:'main',unique:true},name:String,description:String,createdAt:String},{versionKey:false,id:false});
export default mongoose.model('Workspace',schema);
