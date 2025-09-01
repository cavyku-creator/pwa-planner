import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { startOfDay, format } from '../lib/date';

export default function PlannerCalendar({ uid }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));

  useEffect(() => {
    const q = query(collection(db, 'users', uid, 'events'), orderBy('start'));
    const unsub = onSnapshot(q, snap => setEvents(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return () => unsub();
  }, [uid]);

  const grouped = useMemo(() => {
    const byDay = {};
    for (const e of events) {
      const day = startOfDay(new Date(e.start)).toISOString().slice(0,10);
      byDay[day] ??= [];
      byDay[day].push(e);
    }
    return byDay;
  }, [events]);

  const add = async () => {
    if (!title.trim()) return;
    const start = new Date(date + 'T09:00:00');
    const end = new Date(date + 'T10:00:00');
    await addDoc(collection(db, 'users', uid, 'events'), {
      title: title.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
      createdAt: serverTimestamp()
    });
    setTitle('');
  };

  return (
    <div style={{padding:16}}>
      <h3>日程</h3>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="事项标题" style={{flex:1, padding:8}}/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button onClick={add}>添加</button>
      </div>
      {Object.keys(grouped).sort().map(day => (
        <div key={day} style={{marginBottom:12}}>
          <strong>{day}</strong>
          <ul>
            {grouped[day].map(e => (
              <li key={e.id}>[{format(e.start,'HH:mm')}-{format(e.end,'HH:mm')}] {e.title}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
