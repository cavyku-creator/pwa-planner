import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function DailyCheckin({ uid }) {
  const today = new Date().toISOString().slice(0,10);
  const [defs] = useState(['背单词 30min','数学题 2 组','拉伸 10min']);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(collection(db,'users',uid,'checkins'), today), snap => {
      if (snap.exists()) setChecked(snap.data());
      else setChecked({});
    });
    return () => unsub();
  }, [uid, today]);

  const toggle = async (name) => {
    const next = { ...checked, [name]: !checked[name] };
    await setDoc(doc(collection(db,'users',uid,'checkins'), today), next);
  };

  return (
    <div style={{padding:16}}>
      <h3>每日打卡（{today}）</h3>
      <ul>
        {defs.map(name => (
          <li key={name} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0'}}>
            <input type="checkbox" checked={!!checked[name]} onChange={()=>toggle(name)} /> {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
