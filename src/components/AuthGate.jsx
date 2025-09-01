import { useState } from 'react';

export default function AuthGate({ loading, user, onLoginEmail, onSignupEmail, onLoginGoogle, onLogout, children }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  if (loading) return <p style={{padding:16}}>正在加载...</p>;
  if (!user) {
    return (
      <div style={{maxWidth: 420, margin: '10vh auto', padding: 16, border: '1px solid #eaeaea', borderRadius: 12}}>
        <h2>登录 / 注册</h2>
        <input placeholder="邮箱" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="密码" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>onLoginEmail(email,pw)}>邮箱登录</button>
          <button onClick={()=>onSignupEmail(email,pw)}>邮箱注册</button>
          <button onClick={onLoginGoogle}>Google 登录</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',padding:12, background:'#fafafa', borderBottom:'1px solid #eee'}}>
        <div>欢迎，{user.email || user.displayName}</div>
        <button onClick={onLogout}>退出</button>
      </div>
      {children}
    </div>
  );
}
