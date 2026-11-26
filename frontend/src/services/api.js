const API_ROOT=(import.meta.env.VITE_API_URL||'http://localhost:5000/api').replace(/\/$/,'');
const TOKEN_KEY='taskmate_auth_token_v2';
export const getToken=()=>{try{return sessionStorage.getItem(TOKEN_KEY)||''}catch{return ''}};
export const setToken=token=>{try{if(token)sessionStorage.setItem(TOKEN_KEY,token);else sessionStorage.removeItem(TOKEN_KEY)}catch{}}
export async function request(path,{method='GET',body,token=getToken()}={}){
 let response;
 try{
  response=await fetch(API_ROOT+path,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 }catch{
  throw new Error('Cannot reach TASKMATE backend. Start the backend terminal with npm run dev, then try again.');
 }
 const payload=await response.json().catch(()=>({ok:false,message:'Invalid server response.'}));
 if(!response.ok||payload.ok===false)throw new Error(payload.message||`Request failed (${response.status}).`);
 return payload;
}
