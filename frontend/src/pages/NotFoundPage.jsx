import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
export default function NotFoundPage(){const {currentUser}=useWorkspace();return <div className="not-found"><div className="empty-icon"><Compass size={26}/></div><div className="error-number">404</div><h1>Looks like this page got lost.</h1><p>We couldn't find what you're looking for.</p><Link to={currentUser?'/dashboard':'/login'} className="btn btn-primary"><ArrowLeft size={17}/> Back to {currentUser?'dashboard':'sign in'}</Link></div>}
