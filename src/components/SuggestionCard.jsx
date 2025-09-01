import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function SuggestionCard({ uid }) {
  const [tasks, setTasks] = useState([]);
  useEffect(()=>{
    const q = query(collection(db,'users',uid,'tasks'), where('done','==',false));
    return onSnapshot(q, snap => setTasks(snap.docs.map(d=>({id:d.id, ...d.data()}))));
  },[uid]);

  const tip = useMemo(()=>{
    const urgent = tasks.filter(t=>t.priority===1);
    if (urgent.length) return `优先处理：${urgent[0].text}`;
    if (tasks.length) return `先完成 2 个最容易的任务开始：${tasks.slice(0,2).map(t=>t.text).join('、')}`;
    return '今天安排已清空，复盘一下本周目标吧！';
  },[tasks]);

  return (
    <div style={{padding:16, background:'#f6f8fa', borderRadius:12, margin:16}}>
      <strong>今日建议</strong>
      <p style={{marginTop:8}}>{tip}</p>
    </div>
  );
}
