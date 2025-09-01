import { useEffect, useMemo, useState } from 'react';

/** ========= 工具 ========= */
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const weekdayIndex = (d) => (d.getDay() + 6) % 7; // 周一=0 … 周日=6
const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

/** ========= 周期化训练模板 ========= */
const PLAN = [
  { key:'push',   name:'推（胸肩三头）', focus:'胸肩三头', color:'#ff6b6b', blocks:[
    { title:'热身', items:[
      { t:'动态拉伸', note:'上肢 5–8min', duration: 8 },
      { t:'弹力带肩袖激活', duration: 5 }
    ]},
    { title:'主练', items:[
      { t:'卧推/俯卧撑', sets:4, reps:'8–12', rest:90 },
      { t:'上斜哑铃推', sets:3, reps:'10', rest:75 },
      { t:'侧平举', sets:4, reps:'12–15', rest:60 },
      { t:'三头下压', sets:3, reps:'12', rest:60 },
    ]},
    { title:'收尾', items:[ { t:'核心/拉伸', note:'5–10min', duration: 10 } ]},
  ]},
  { key:'cardio', name:'有氧 + 核心', focus:'心肺&核心', color:'#4ecdc4', blocks:[
    { title:'有氧', items:[ { t:'快走/慢跑/椭圆', note:'30–40min（RPE 6）', duration: 35} ]},
    { title:'核心', items:[
      { t:'平板支撑', note:'3×45s', sets:3, duration:3 },
      { t:'死虫/鸟狗', note:'3×10', sets:3, duration:5 },
      { t:'俄罗斯转体', note:'3×20', sets:3, duration:5 },
    ]},
    { title:'拉伸', items:[ { t:'下肢后链/髂腰肌', note:'8–10min', duration:10} ]},
  ]},
  { key:'pull',   name:'拉（背二头）', focus:'背二头', color:'#45b7d1', blocks:[
    { title:'热身', items:[ { t:'动态拉伸+背阔激活', note:'5–8min', duration:8} ]},
    { title:'主练', items:[
      { t:'引体/下拉', sets:4, reps:'8–12', rest:90 },
      { t:'坐姿划船', sets:3, reps:'10–12', rest:75 },
      { t:'面拉', sets:3, reps:'15', rest:60 },
      { t:'弯举', sets:3, reps:'12', rest:60 },
    ]},
    { title:'收尾', items:[ { t:'颈肩背拉伸', note:'5–8min', duration:8} ]},
  ]},
  { key:'mob',    name:'灵活度 + 轻跑', focus:'灵活&恢复', color:'#96ceb4', blocks:[
    { title:'灵活', items:[ { t:'踝/髋/胸椎灵活', note:'10min', duration:10} ]},
    { title:'跑步', items:[ { t:'轻松跑', note:'20–30min（能说话）', duration:25} ]},
    { title:'放松', items:[ { t:'泡沫轴/拉伸', note:'10min', duration:10} ]},
  ]},
  { key:'legs',   name:'腿（股四/臀/腘）', focus:'下肢力量', color:'#feca57', blocks:[
    { title:'热身', items:[ { t:'动态拉伸+激活', note:'8–10min', duration:10} ]},
    { title:'主练', items:[
      { t:'深蹲/杯式深蹲', sets:4, reps:'8–10', rest:120 },
      { t:'罗马尼亚硬拉', sets:3, reps:'8–10', rest:90 },
      { t:'弓步/腿举', sets:3, reps:'10/侧', rest:75 },
      { t:'提踵', sets:4, reps:'12–15', rest:45 },
    ]},
    { title:'收尾', items:[ { t:'下肢拉伸', note:'8–10min', duration:10} ]},
  ]},
  { key:'metcon', name:'全身循环（代谢）', focus:'代谢', color:'#ff9ff3', blocks:[
    { title:'循环训练', items:[
      { t:'壶铃摆动 × 15', duration:1 },
      { t:'俯卧撑 × 12', duration:1 },
      { t:'徒手深蹲 × 20', duration:1 },
      { t:'仰卧起坐 × 15', duration:1 },
      { t:'开合跳 × 30s', duration:1 },
    ]},
    { title:'冷却', items:[ { t:'走路 5min + 拉伸', duration:10} ]},
  ]},
  { key:'rest',   name:'休息 + 拉伸', focus:'恢复', color:'#a8e6cf', blocks:[
    { title:'轻松活动', items:[ { t:'散步/瑜伽', note:'30–40min', duration:35} ]},
    { title:'放松', items:[ { t:'全身拉伸/泡沫轴', note:'15–20min', duration:20} ]},
  ]},
];

export default function WorkoutPlan() {
  /** ========== 日期与模板 ========== */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = fmt(selectedDate);
  const dIdx = weekdayIndex(selectedDate);
  const today = PLAN[dIdx];

  /** ========== 标签页 ========== */
  const [tab, setTab] = useState(localStorage.getItem('wp_tab') || 'train');
  useEffect(() => { localStorage.setItem('wp_tab', tab); }, [tab]);

  /** ========== 训练状态 ========== */
  const [mode, setMode] = useState('40');  // 20 / 40 / 60
  const [checks, setChecks] = useState({});
  const [setsData, setSets] = useState({});
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 训练计时器
  useEffect(() => {
    let interval;
    if (isTimerRunning) interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => interval && clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  /** ========== 根据模式筛选动作 ========== */
  const filteredBlocks = useMemo(() => {
    if (mode === '60') return today.blocks;
    if (mode === '40') {
      return today.blocks.map((b) => ({
        ...b,
        items: b.title.includes('主练')
          ? b.items.slice(0, Math.ceil(b.items.length * 0.75))
          : b.items.slice(0, Math.max(1, b.items.length - 1)),
      }));
    }
    // 20min
    return today.blocks.map((b) => {
      if (b.title.includes('主练')) return { ...b, items: b.items.slice(0, Math.min(2, b.items.length)) };
      return { ...b, items: b.items.slice(0, 1) };
    });
  }, [today, mode]);

  /** ========== 训练统计 ========== */
  const stats = useMemo(() => {
    let done = 0, total = 0, totalTime = 0;
    filteredBlocks.forEach((b, bi) => {
      b.items.forEach((it, ii) => {
        const id = `b${bi}_i${ii}`;
        total += 1;
        if (checks[id]) done += 1;
        if (it.duration) totalTime += it.duration;
        else if (it.sets && it.rest) totalTime += (it.sets * 1.5) + ((it.sets - 1) * it.rest / 60);
        else totalTime += 3;
      });
    });
    return {
      done,
      total,
      completion: total ? Math.round((done / total) * 100) : 0,
      estimatedTime: Math.round(totalTime),
    };
  }, [filteredBlocks, checks]);

  /** ========== 身体/心理 ========== */
  const [sleepHours, setSleepHours] = useState(7);
  const [waterIntake, setWaterIntake] = useState(0);
  const [weight, setWeight] = useState(0);
  const [meals, setMeals] = useState([]); // {type, calories}

  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [gratitude, setGratitude] = useState('');

  // 冥想计时器（独立）
  const [medTimer, setMedTimer] = useState(0);
  const [medRun, setMedRun] = useState(false);
  useEffect(() => {
    let h;
    if (medRun) h = setInterval(() => setMedTimer((t) => t + 1), 1000);
    return () => h && clearInterval(h);
  }, [medRun]);

  /** ========== 历史：localStorage 持久化 ========== */
  const HISTORY_KEY = 'healthHistory';
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); }
    catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // 保存记录（整合训练+健康）
  const saveToHistory = () => {
    const record = {
      date: dateKey,
      plan: today.key,
      mode,
      rpe,
      notes,
      checks,
      setsData,
      completion: stats.completion,
      actualTime: timer,
      sleepHours,
      waterIntake,
      weight,
      meals,
      mood,
      stress,
      gratitude,
    };
    setHistory((prev) => ({ ...prev, [dateKey]: record }));
    alert(`✅ 已保存 ${dateKey} 的健康记录`);
  };

  // 导出文字
  const exportToday = () => {
    const lines = [];
    filteredBlocks.forEach((b, bi) => {
      lines.push(`【${b.title}】`);
      b.items.forEach((it, ii) => {
        const id = `b${bi}_i${ii}`;
        const s = setsData[id];
        const meta = s && (s.kg || s.reps)
          ? `（${s.kg || '-'}kg × ${s.reps || '-'}次）`
          : it.note ? `（${it.note}）` : '';
        lines.push(`- [${checks[id] ? '✓' : ' '}] ${it.t} ${meta}`);
      });
    });

    const text = `【健康记录】${dateKey}（周${WEEK[dIdx]}）
【训练主题】${today.name}
【时长模式】${mode}分钟
【完成度】${stats.done}/${stats.total} (${stats.completion}%)
【实际用时】${formatTime(timer)}
【RPE】${rpe}/10

【睡眠】${sleepHours} 小时
【饮水】${waterIntake} ml
【体重】${weight || '-'} kg
【饮食】${meals.map(m => `${m.type}:${m.calories}cal`).join('; ') || '无'}

【心情】${mood}/10
【压力】${stress}/10
【感恩】${gratitude || '无'}

${lines.join('\n')}

【备注】
${notes || '无'}
`;
    navigator.clipboard.writeText(text)
      .then(() => alert('📋 记录已复制到剪贴板'))
      .catch(() => {
        const w = window.open('', '_blank');
        w.document.write(`<pre style="font-family: monospace; padding: 20px; white-space: pre-wrap;">${text}</pre>`);
      });
  };

  // 切换日期：优先加载历史
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);

    const key = fmt(newDate);
    const rec = history[key] || {};

    // 训练
    setChecks(rec.checks || {});
    setSets(rec.setsData || {});
    setRpe(rec.rpe ?? 5);
    setNotes(rec.notes || '');
    setTimer(rec.actualTime || 0);
    setIsTimerRunning(false);

    // 身体
    setSleepHours(rec.sleepHours ?? 7);
    setWaterIntake(rec.waterIntake ?? 0);
    setWeight(rec.weight ?? 0);
    setMeals(rec.meals || []);

    // 心理
    setMood(rec.mood ?? 5);
    setStress(rec.stress ?? 5);
    setGratitude(rec.gratitude || '');
  };

  /** ========== 训练建议（基于 RPE） ========== */
  const trainingSuggestion = useMemo(() => {
    if (!rpe) return '设置 RPE 可获得个性化强度建议';
    if (rpe >= 9) return '🔥 强度过高：建议减少1组或降重5–10%，并拉伸放松。';
    if (rpe >= 8) return '⚡ 略高：下次可减少1组或降重5%。';
    if (rpe <= 6) return '💪 可加强：下次可加 2.5kg 或每组+1–2次。';
    return '✅ 强度适中：保持节奏。';
  }, [rpe]);

  /** ========== 综合健康评分（0-10） ========== */
  const overallHealthScore = useMemo(() => {
    const factors = [
      (stats.completion / 100) * 10,               // 完成度
      mood,                                        // 心情
      10 - stress,                                 // 压力反向
      sleepHours > 7 ? 10 : (sleepHours / 7) * 10, // 睡眠
      waterIntake > 2000 ? 10 : (waterIntake / 2000) * 10, // 水分
      rpe > 0 ? 10 - Math.abs(rpe - 7) : 0         // 理想 RPE=7
    ];
    const valid = factors.filter((x) => Number.isFinite(x));
    return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
  }, [stats.completion, mood, stress, sleepHours, waterIntake, rpe]);

  const overallSuggestion = useMemo(() => {
    if (overallHealthScore >= 8) return '🌟 状态优秀！保持节奏与睡眠质量。';
    if (overallHealthScore >= 6) return '👍 不错：维持训练，补水与拉伸别忘了。';
    if (stress > 7 || mood < 4) return '🧘 注意心理：试试 5 分钟冥想和散步放松。';
    if (sleepHours < 6) return '😴 优先睡眠：目标 7–8 小时，晚间减少电子设备。';
    return '💡 从小处做起：多喝水、简短训练、记录心情。';
  }, [overallHealthScore, stress, mood, sleepHours]);

  /** ========== 组件 UI ========== */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 头部 */}
        <header style={{
          background: 'rgba(255,255,255,0.96)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
            <div>
              <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:'#2d3748' }}>🩺 个人健康助理</h1>
              <div style={{ color:'#666', marginTop:6 }}>训练 · 身体 · 心理 · 全面追踪与建议</div>
            </div>
            <div style={{
              background: today.color, color:'#fff', padding:'10px 16px',
              borderRadius:12, minWidth:140, textAlign:'center'
            }}>
              <div style={{ fontSize:12, opacity:.9 }}>今日主题</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{today.name}</div>
            </div>
          </div>

          {/* 日期 + 标签 */}
          <div style={{
            marginTop:16, display:'grid',
            gridTemplateColumns:'1fr auto', gap:12, alignItems:'center'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={()=>changeDate(-1)} style={btnGhost}>← 前一天</button>
              <div style={{
                flex:1, textAlign:'center', fontSize:18, fontWeight:700,
                background:'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
              }}>
                {dateKey}（周{WEEK[dIdx]}）
              </div>
              <button onClick={()=>changeDate(1)} style={btnGhost}>后一天 →</button>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              {[
                {k:'train', label:'🏋️ 训练'},
                {k:'body',  label:'🛌 身体'},
                {k:'mind',  label:'🧠 心理'},
                {k:'dash',  label:'📊 仪表盘'},
              ].map(t => (
                <button key={t.k} onClick={()=>setTab(t.k)}
                        style={{ ...tabBtn, ...(tab===t.k ? tabBtnActive : {}) }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ========== Tab: 训练 ========== */}
        {tab === 'train' && (
          <>
            {/* 统计卡片 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12, marginBottom:16 }}>
              <CardStat title="完成度" value={`${stats.completion}%`} color={today.color} />
              <CardStat title="用时" value={formatTime(timer)} />
              <CardStat title="RPE" value={rpe || '-'} color="#e53e3e" />
              <CardStat title="模式" value={`${mode} min`} color="#38a169" />
            </div>

            {/* 设置面板 */}
            <section style={panel}>
              <h2 style={h2}>⚙️ 训练设置</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:20 }}>
                {/* 模式 */}
                <div>
                  <Label>时长模式</Label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[
                      {v:'20', t:'20min 快速', d:'核心动作'},
                      {v:'40', t:'40min 标准', d:'完整训练'},
                      {v:'60', t:'60min 完整', d:'全量训练'},
                    ].map(m => (
                      <button key={m.v} onClick={()=>setMode(m.v)} style={{
                        flex:1, padding:'12px 8px', borderRadius:8, border:'none',
                        background: mode===m.v ? today.color : '#f7fafc',
                        color: mode===m.v ? '#fff' : '#4a5568',
                        cursor:'pointer', fontSize:12, fontWeight:700
                      }}>
                        <div>{m.t}</div>
                        <div style={{fontSize:10, opacity:.8}}>{m.d}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RPE */}
                <div>
                  <Label>运动自觉强度 RPE (1-10)</Label>
                  <input type="range" min="1" max="10" value={rpe}
                         onChange={e=>setRpe(Number(e.target.value))}
                         style={{ width:'100%', marginBottom:8 }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#666' }}>
                    <span>很轻松</span>
                    <span style={{ fontWeight:700, color:today.color }}>{rpe}</span>
                    <span>极限</span>
                  </div>
                </div>

                {/* 计时器 */}
                <div>
                  <Label>训练计时器</Label>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      fontSize:24, fontWeight:800, color:today.color,
                      background:'#f7fafc', padding:'8px 16px', borderRadius:8, minWidth:90, textAlign:'center'
                    }}>
                      {formatTime(timer)}
                    </div>
                    <button onClick={()=>setIsTimerRunning(!isTimerRunning)}
                            style={{ ...btn, background: isTimerRunning ? '#e53e3e' : '#38a169' }}>
                      {isTimerRunning ? '暂停' : '开始'}
                    </button>
                    <button onClick={()=>{ setTimer(0); setIsTimerRunning(false); }} style={{ ...btn, background:'#a0aec0' }}>
                      重置
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ ...tip, marginTop:16 }}>
                💡 <b>智能建议：</b>{trainingSuggestion}
              </div>
            </section>

            {/* 明细 */}
            <section style={panel}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h2 style={h2}>🏃‍♂️ 训练明细（{today.focus}）</h2>
                <div style={{ fontSize:14, color:'#666' }}>
                  预计用时：{stats.estimatedTime} 分钟 | 完成：{stats.done}/{stats.total}
                </div>
              </div>

              {filteredBlocks.map((blk, bi) => (
                <div key={bi} style={{ marginBottom:16, border:`2px solid ${today.color}20`, borderRadius:12, overflow:'hidden' }}>
                  <div style={{ background:`${today.color}15`, padding:'10px 16px', fontWeight:800, color:'#2d3748' }}>
                    {blk.title}
                  </div>
                  <div style={{ padding:'10px 16px' }}>
                    {blk.items.map((it, ii) => {
                      const id = `b${bi}_i${ii}`;
                      const tracked = typeof it.sets !== 'undefined';
                      const s = setsData[id] || {};
                      const isDone = !!checks[id];
                      return (
                        <div key={id} style={{
                          display:'grid',
                          gridTemplateColumns: tracked ? 'auto 1fr auto auto' : 'auto 1fr',
                          gap:12, alignItems:'center', padding:'10px 0',
                          borderBottom: ii < blk.items.length - 1 ? '1px solid #e2e8f0' : 'none',
                          background: isDone ? '#f0fff4' : 'transparent', borderRadius:8
                        }}>
                          <input type="checkbox" checked={isDone}
                                 onChange={e=>setChecks(prev=>({...prev, [id]:e.target.checked}))}
                                 style={{ transform:'scale(1.2)' }} />
                          <div>
                            <div style={{
                              fontWeight:700, color: isDone ? '#38a169' : '#2d3748',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>{it.t}</div>
                            {(it.sets || it.note) && (
                              <div style={{ fontSize:12, color:'#666', marginTop:4 }}>
                                {it.sets && `建议 ${it.sets} 组 × ${it.reps} 次`}
                                {it.sets && it.rest && ` | 组间休息 ${it.rest}s`}
                                {it.note && ` | ${it.note}`}
                              </div>
                            )}
                          </div>
                          {tracked && (
                            <>
                              <input placeholder="重量 kg" value={s.kg || ''} onChange={e=>setSets(prev=>({...prev, [id]:{...(prev[id]||{}), kg:e.target.value}}))}
                                     style={inputSm} />
                              <input placeholder="次数" value={s.reps || ''} onChange={e=>setSets(prev=>({...prev, [id]:{...(prev[id]||{}), reps:e.target.value}}))}
                                     style={inputSm} />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            {/* 备注 */}
            <section style={panel}>
              <h2 style={h2}>📝 训练备注</h2>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                        placeholder="记录今日感受、疼痛部位、训练节奏、下次改进点..."
                        style={textarea} />
              <div style={{ ...tip, marginTop:12 }}>
                💡 若本周出现 ≥2 次 RPE≥8，建议下周进行「减量周」（每项 -1 组或 -10% 重量）
              </div>
            </section>
          </>
        )}

        {/* ========== Tab: 身体 ========== */}
        {tab === 'body' && (
          <section style={panel}>
            <h2 style={h2}>🛌 身体健康追踪</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:16 }}>
              <div>
                <Label>睡眠时长（小时）</Label>
                <input type="number" min="0" max="24" value={sleepHours}
                       onChange={e=>setSleepHours(Number(e.target.value))} style={input} />
              </div>
              <div>
                <Label>今日喝水（ml）</Label>
                <div style={{ display:'flex', gap:8 }}>
                  <input type="number" step="100" value={waterIntake}
                         onChange={e=>setWaterIntake(Number(e.target.value))} style={input} />
                  <button onClick={()=>setWaterIntake(v=>v+250)} style={btn}>+一杯 (250ml)</button>
                </div>
              </div>
              <div>
                <Label>体重（kg）</Label>
                <input type="number" step="0.1" value={weight}
                       onChange={e=>setWeight(Number(e.target.value))} style={input} />
              </div>
            </div>

            <div style={{ marginTop:16 }}>
              <h3 style={{ margin:'12px 0', color:'#2d3748' }}>🍽️ 饮食记录</h3>
              {meals.map((m, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:8 }}>
                  <input value={m.type} placeholder="餐次 如 早餐/午餐/加餐"
                         onChange={e=>{ const arr=[...meals]; arr[i].type=e.target.value; setMeals(arr); }}
                         style={input} />
                  <input type="number" value={m.calories} placeholder="热量 cal"
                         onChange={e=>{ const arr=[...meals]; arr[i].calories=Number(e.target.value||0); setMeals(arr); }}
                         style={input} />
                  <button onClick={()=>{ const arr=[...meals]; arr.splice(i,1); setMeals(arr); }}
                          style={{ ...btn, background:'#e53e3e' }}>删除</button>
                </div>
              ))}
              <button onClick={()=>setMeals(prev=>[...prev, {type:'', calories:0}])} style={btn}>
                + 添加餐次
              </button>
            </div>
          </section>
        )}

        {/* ========== Tab: 心理 ========== */}
        {tab === 'mind' && (
          <section style={panel}>
            <h2 style={h2}>🧠 心理健康管理</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:16 }}>
              <div>
                <Label>今日心情 (1-10)</Label>
                <input type="range" min="1" max="10" value={mood} onChange={e=>setMood(Number(e.target.value))} style={{ width:'100%' }} />
                <div style={{ textAlign:'right', color:'#666', fontSize:12 }}>当前：{mood}</div>
              </div>
              <div>
                <Label>压力水平 (1-10)</Label>
                <input type="range" min="1" max="10" value={stress} onChange={e=>setStress(Number(e.target.value))} style={{ width:'100%' }} />
                <div style={{ textAlign:'right', color:'#666', fontSize:12 }}>当前：{stress}</div>
              </div>
            </div>

            <div style={{ marginTop:16 }}>
              <Label>今日感恩（至少 1–3 件事）</Label>
              <textarea value={gratitude} onChange={e=>setGratitude(e.target.value)}
                        placeholder="例：1. 身体健康  2. 家人支持  3. 今日的好天气" style={textarea} />
            </div>

            <div style={{ marginTop:16 }}>
              <h3 style={{ margin:'12px 0', color:'#2d3748' }}>🧘 冥想计时器</h3>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:24, fontWeight:800, color:'#805ad5', background:'#f7fafc', padding:'8px 16px', borderRadius:8 }}>
                  {formatTime(medTimer)}
                </div>
                <button onClick={()=>setMedRun(r=>!r)} style={{ ...btn, background: medRun ? '#e53e3e' : '#805ad5' }}>
                  {medRun ? '暂停' : '开始 5min 冥想'}
                </button>
                <button onClick={()=>{ setMedTimer(0); setMedRun(false); }} style={{ ...btn, background:'#a0aec0' }}>
                  重置
                </button>
              </div>
              <div style={{ ...tip, marginTop:12 }}>
                练习「方块呼吸」：吸气 4s → 屏息 4s → 呼气 4s → 屏息 4s，循环 5 分钟。
              </div>
            </div>
          </section>
        )}

        {/* ========== Tab: 仪表盘 ========== */}
        {tab === 'dash' && (
          <section style={panel}>
            <h2 style={h2}>📊 健康仪表盘</h2>
            <div style={{ textAlign:'center', margin:'12px 0 20px' }}>
              <div style={{ fontSize:48, fontWeight:900, color: overallHealthScore >= 7 ? '#38a169' : '#e53e3e' }}>
                {overallHealthScore}/10
              </div>
              <div style={{ color:'#4a5568', marginTop:8 }}>{overallSuggestion}</div>
            </div>

            <h3 style={{ margin:'12px 0', color:'#2d3748' }}>🗂️ 最近记录</h3>
            <div style={{ display:'grid', gap:8 }}>
              {Object.values(history).sort((a,b)=>a.date.localeCompare(b.date)).slice(-7).map((r, i) => (
                <div key={i} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', background:'#f7fafc', borderRadius:8
                }}>
                  <div>
                    <b>{r.date}</b>
                    <span style={{ marginLeft:12, color:'#666' }}>{PLAN.find(p=>p.key===r.plan)?.name}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, color:'#666', fontSize:14 }}>
                    <span>完成度 {r.completion}%</span>
                    {Number.isFinite(r.sleepHours) && <span>睡眠 {r.sleepHours}h</span>}
                    {Number.isFinite(r.waterIntake) && <span>喝水 {r.waterIntake}ml</span>}
                    {Number.isFinite(r.mood) && <span>心情 {r.mood}</span>}
                  </div>
                </div>
              ))}
              {Object.keys(history).length === 0 && (
                <div style={{ color:'#666' }}>暂无记录，先到「训练/身体/心理」页填写并保存吧～</div>
              )}
            </div>
          </section>
        )}

        {/* 操作按钮（各标签通用） */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:16 }}>
          <button onClick={saveToHistory} style={ctaPrimary}>💾 保存健康记录</button>
          <button onClick={exportToday} style={ctaSecondary}>📋 导出记录</button>
        </div>

        {/* 周计划预览（始终显示） */}
        <section style={{ ...panel, marginTop:16 }}>
          <h2 style={h2}>📅 本周计划预览</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:8 }}>
            {PLAN.map((day, idx) => {
              const dayDate = new Date(selectedDate);
              dayDate.setDate(selectedDate.getDate() + (idx - dIdx));
              const key = fmt(dayDate);
              const isToday = idx === dIdx;
              const rec = history[key];
              return (
                <div key={idx} onClick={()=>setSelectedDate(dayDate)}
                     style={{
                       padding:12, borderRadius:8, textAlign:'center', cursor:'pointer', transition:'all .2s',
                       background: isToday ? day.color : rec ? '#f0fff4' : '#f7fafc',
                       color: isToday ? '#fff' : '#2d3748', border: isToday ? 'none' : '1px solid #e2e8f0'
                     }}>
                  <div style={{ fontSize:12, opacity:.8 }}>周{WEEK[idx]}</div>
                  <div style={{ fontSize:14, fontWeight:700, margin:'4px 0' }}>{day.name}</div>
                  <div style={{ fontSize:10, opacity:.7 }}>{day.focus}</div>
                  {rec && (
                    <div style={{ fontSize:10, marginTop:4, color: isToday ? 'rgba(255,255,255,0.9)' : '#38a169' }}>
                      ✓ {rec.completion}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/** ======== 小组件 & 样式 ======== */
function CardStat({ title, value, color = '#2d3748' }) {
  return (
    <div style={{ background:'#f7fafc', padding:16, borderRadius:12, textAlign:'center' }}>
      <div style={{ fontSize:24, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:12, color:'#666' }}>{title}</div>
    </div>
  );
}

const h2 = { margin:'0 0 12px 0', color:'#2d3748', fontSize:20 };
const panel = {
  background:'rgba(255,255,255,0.96)',
  borderRadius:16,
  padding:16,
  marginBottom:16,
  boxShadow:'0 6px 20px rgba(0,0,0,0.06)'
};
const btn = {
  background:'#4a5568', color:'#fff', border:'none',
  padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:700
};
const btnGhost = {
  background:'none', border:'2px solid #e2e8f0', borderRadius:8,
  padding:'8px 12px', cursor:'pointer', color:'#4a5568'
};
const tabBtn = {
  background:'#f7fafc', color:'#4a5568', border:'1px solid #e2e8f0',
  padding:'8px 12px', borderRadius:8, cursor:'pointer', fontWeight:700
};
const tabBtnActive = { background:'#4a5568', color:'#fff', border:'1px solid #4a5568' };
const input = { width:'100%', padding:'10px 12px', border:'2px solid #e2e8f0', borderRadius:8, fontSize:14 };
const inputSm = { width:90, padding:8, borderRadius:6, border:'2px solid #e2e8f0', fontSize:14 };
const textarea = { width:'100%', minHeight:100, padding:16, border:'2px solid #e2e8f0', borderRadius:12, fontSize:14, fontFamily:'inherit', resize:'vertical' };
const tip = { padding:12, background:'#e6fffa', border:'1px solid #81e6d9', borderRadius:8, color:'#234e52', fontSize:14 };
const ctaPrimary = {
  background:'linear-gradient(135deg, #667eea, #764ba2)',
  color:'#fff', border:'none', padding:'14px 24px', borderRadius:12, cursor:'pointer',
  fontWeight:800, fontSize:16, boxShadow:'0 4px 16px rgba(102,126,234,0.3)'
};
const ctaSecondary = {
  background:'linear-gradient(135deg, #38a169, #2f855a)',
  color:'#fff', border:'none', padding:'14px 24px', borderRadius:12, cursor:'pointer',
  fontWeight:800, fontSize:16, boxShadow:'0 4px 16px rgba(56,161,105,0.3)'
};
function Label({ children }) {
  return <div style={{ fontSize:14, fontWeight:700, marginBottom:8, color:'#4a5568' }}>{children}</div>;
}
