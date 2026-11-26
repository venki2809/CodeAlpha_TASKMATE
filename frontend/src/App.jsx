import { Navigate, Route, Routes } from 'react-router-dom';
import { useWorkspace } from './context/WorkspaceContext';
import AppShell from './components/AppShell';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectPage from './pages/ProjectPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamPage from './pages/TeamPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function Private({children}) {const {currentUser}=useWorkspace();return currentUser?children:<Navigate to="/login" replace/>;}
function Guest({children}) {const {currentUser}=useWorkspace();return currentUser?<Navigate to="/dashboard" replace/>:children;}
export default function App(){
  const {currentUser,ready}=useWorkspace();
  if(!ready)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'Inter,Arial,sans-serif'}}>Opening TASKMATE…</div>;
  return <>
    <Routes>
      <Route path="/" element={<Navigate to={currentUser?'/dashboard':'/login'} replace/>}/>
      <Route path="/login" element={<Guest><LoginPage/></Guest>}/>
      <Route path="/register" element={<Guest><RegisterPage/></Guest>}/>
      <Route element={<Private><AppShell/></Private>}>
        <Route path="/dashboard" element={<DashboardPage/>}/>
        <Route path="/projects" element={<ProjectsPage/>}/>
        <Route path="/projects/:projectId" element={<ProjectPage/>}/>
        <Route path="/my-tasks" element={<MyTasksPage/>}/>
        <Route path="/team" element={<TeamPage/>}/>
        <Route path="/activity" element={<ActivityPage/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
      </Route>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
    <Toast/>
  </>;
}
