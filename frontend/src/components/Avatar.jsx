import { initials } from '../utils/helpers';

export default function Avatar({user,size='md',className=''}) {
  if (!user) return <span className={`avatar avatar-${size} avatar-muted ${className}`} aria-label="Unassigned">?</span>;
  return <span className={`avatar avatar-${size} ${className}`} title={user.name} aria-label={user.name} style={{background:user.color||'#dce4f8'}}>{initials(user.name)}</span>;
}
export function AvatarStack({ids=[],users=[],limit=4,size='sm'}){
  const people=ids.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  if(!people.length) return <span className="muted-small">Unassigned</span>;
  return <div className="avatar-stack">{people.slice(0,limit).map(u=><Avatar user={u} key={u.id} size={size}/>)}{people.length>limit&&<span className={`avatar avatar-${size} avatar-more`}>+{people.length-limit}</span>}</div>;
}
