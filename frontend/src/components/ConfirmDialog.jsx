import { AlertTriangle, X } from 'lucide-react';
export default function ConfirmDialog({title='Are you sure?',description='This action cannot be undone.',confirmLabel='Delete',onConfirm,onCancel,danger=true}){
 return <div className="modal-backdrop modal-top" onMouseDown={e=>{e.stopPropagation();onCancel()}} role="presentation"><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text" onMouseDown={e=>e.stopPropagation()}>
   <div className="confirm-icon"><AlertTriangle size={21}/></div><h3 id="confirm-title">{title}</h3><p id="confirm-text">{description}</p>
   <div className="dialog-actions"><button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button><button type="button" className={`btn ${danger?'btn-danger':'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button></div>
 </div></div>;
}
