import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function TaskList({ uid }) {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'tasks'),
      where('archived', '==', false),
      orderBy('done', 'asc'),
      orderBy('due', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  const add = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'users', uid, 'tasks'), {
      text: text.trim(),
      done: false,
      priority: 2,
      due: null,
      createdAt: serverTimestamp(),
      archived: false,
      project: '收件箱'
    });
    setText('');
  };

  const toggle = async (t) => {
    await updateDoc(doc(db, 'users', uid, 'tasks', t.id), { done: !t.done });
  };

  return (
    <div style={{padding:16}}>
      <h3>任务清单</h3>
      <div style={{display:'flex', gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="添加任务..." style={{flex:1, padding:8}} />
        <button onClick={add}>添加</button>
      </div>
      <ul>
        {tasks.map(t => (
          <li key={t.id} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #f0f0f0'}}>
            <input type="checkbox" checked={!!t.done} onChange={()=>toggle(t)} />
            <span style={{textDecoration: t.done ? 'line-through' : 'none'}}>{t.text}</span>
            {t.priority === 1 && <span>🔥</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
