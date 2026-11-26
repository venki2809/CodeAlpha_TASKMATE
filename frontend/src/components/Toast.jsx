import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
export default function Toast(){
 const {toast,setToast}=useWorkspace();
 if(!toast)return null;
 return <div className={`toast ${toast.kind==='error'?'toast-error':''}`} role="status" aria-live="polite">{toast.kind==='error'?<AlertCircle size={18}/>:<CheckCircle2 size={18}/>}<span>{toast.message}</span><button type="button" className="icon-btn" aria-label="Dismiss notification" onClick={()=>setToast(null)}><X size={15}/></button></div>;
}
