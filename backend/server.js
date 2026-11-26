import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspace.js';
import {connectStore,mode,closeStore} from './config/store.js';

const app=express();
app.disable('x-powered-by');
app.use(helmet());
const clients=(process.env.CLIENT_URL||'http://localhost:5173').split(',').map(s=>s.trim());
// Accept alternative localhost port when Vite chooses the next free port.
app.use(cors({origin:(origin,cb)=>!origin||clients.includes(origin)||/^http:\/\/(localhost|127\.0\.0\.1):517\d$/.test(origin)?cb(null,true):cb(new Error('CORS origin not allowed'))}));
app.use(express.json({limit:'1mb'}));
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'TASKMATE API',database:mode(),time:new Date().toISOString()}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:70,standardHeaders:'draft-7',legacyHeaders:false}),authRoutes);
app.use('/api',workspaceRoutes);
app.use('/api',(req,res)=>res.status(404).json({ok:false,message:'API route not found.'}));
app.use((err,req,res,_next)=>{
  const status=err.status||((err instanceof SyntaxError&&err.status===400)?400:500);
  if(status>=500) console.error('API error:',err);
  res.status(status).json({ok:false,message:status>=500?'An unexpected server error occurred.':err.message});
});
const port=Number(process.env.PORT)||5000;
try{
 await connectStore();
 const server=app.listen(port,()=>console.log(`🚀 TASKMATE API: http://localhost:${port}/api/health`));
 const stop=async()=>{server.close();await closeStore();process.exit(0)};
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
}catch(error){console.error('Unable to start TASKMATE:',error.message);process.exit(1)}
