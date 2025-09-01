import { useEffect, useRef } from 'react';
import '../study.css';

export default function StudyDashboard() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const $  = (s, r=root) => r.querySelector(s);
    const $$ = (s, r=root) => Array.from(r.querySelectorAll(s));

    // ====== 外部计划（从 public/plan.json 读取）======
    // 结构：{ "YYYY-MM-DD": { phase: string, tasks: [{time,title,category}] } }
    let PLAN = null;
    fetch('/plan.json')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { PLAN = data || null; renderTasks(); renderCalendar(); })
      .catch(() => {/* 没放 plan.json 也没关系，继续用内置生成器 */});

    // ====== 常量 / 阶段（从 9/1 开始）======
    const EXAM_DATE = new Date('2025-12-20T00:00:00');
    const PHASES = [
      {k:'p1', name:'阶段一·高效打基础（9.1–9.30）',  start:'2025-09-01', end:'2025-09-30'},
      {k:'p2', name:'阶段二·强化突破（10.1–10.31）',   start:'2025-10-01', end:'2025-10-31'},
      {k:'p3', name:'阶段三·真题制胜（11.1–11.30）',  start:'2025-11-01', end:'2025-11-30'},
      {k:'p4', name:'阶段四·完美收官（12.1–12.20）',   start:'2025-12-01', end:'2025-12-20'},
    ];

    // ====== 工具（本地时区；避免 toISOString 带来的 -1 天）======
    const fmtDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const parseYMD = (s) => {
      const [y, m, day] = s.split('-').map(Number);
      return new Date(y, m - 1, day);
    };
    const inRange = (d, start, end)=> d>=parseYMD(start) && d<=parseYMD(end);
    const getPhase = (d)=> PHASES.find(p=>inRange(d, p.start, p.end));
    const dayIndexInPhase = (d, p)=> Math.floor((d-parseYMD(p.start))/(1000*3600*24));

    // ====== 学习资料序列 ======
    const zhangyu30 = Array.from({length:30}, (_,i)=>`张宇《基础30讲》·第 ${i+1} 讲`);
    const zhangyu36 = Array.from({length:36}, (_,i)=>`张宇《强化36讲》·第 ${i+1} 讲`);
    const zhangyu8set = Array.from({length:8},  (_,i)=>`张宇《8套卷》·第 ${i+1} 套（全程计时）`);
    const zhangyu4set = Array.from({length:4},  (_,i)=>`张宇《4套卷》·第 ${i+1} 套（全程计时）`);
    const lyl660_la   = Array.from({length:12}, (_,i)=>`李永乐《线代·基础讲义》·第 ${i+1} 讲`);
    const lylTrueImprove = Array.from({length:20}, (_,i)=>`李永乐《真题真刷·提高篇》·专题 ${i+1}`);
    const yearsMath = [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];

    const yearsEn = Array.from({length:20}, (_,i)=>2006+i);
    const enReadLogic = Array.from({length:20}, (_,i)=>`唐迟《阅读的逻辑》·第 ${i+1} 章`);
    const enJuju      = Array.from({length:50}, (_,i)=>`田静《句句真研》·模块 ${i+1}（3–5句精练）`);
    const enEssayFuncs= Array.from({length:30}, (_,i)=>`石雷鹏《30个功能句》·功能句 ${i+1}`);

    const sigChaps = Array.from({length:12}, (_,i)=>`《信号与系统》·第 ${i+1} 章`);
    const digChaps = Array.from({length:12}, (_,i)=>`《数字电路与系统设计》·第 ${i+1} 章`);
    const sigTrue  = Array.from({length:12}, (_,i)=>`信号与系统真题·套题 ${i+1}`);
    const digTrue  = Array.from({length:12}, (_,i)=>`数字电路真题·套题 ${i+1}`);

    const coreKaoan = Array.from({length:16}, (_,i)=>`《核心考案》·第 ${i+1} 章框架`);
    const xsr1000   = Array.from({length:16}, (_,i)=>`肖秀荣《1000题》·第 ${i+1} 章 选择题 20–30 题`);
    const xiao8     = Array.from({length:8},  (_,i)=>`《肖八》·第 ${i+1} 套（选择题+大题框架）`);
    const xiao4     = Array.from({length:4},  (_,i)=>`《肖四》·第 ${i+1} 套（背诵+选择）`);

    const pick = (arr, idx, fb='错题巩固 / 总结复盘')=> arr[idx] || fb;

    // ====== 生成器（用于 JSON 没有该日时的回退）======
    function buildDayPlan(date){
      const ph = getPhase(date);
      const tasks = [];
      const idx = dayIndexInPhase(date, ph||{start:fmtDate(date)});
      const add = (t, title, cat)=> tasks.push({t, title, cat});

      const meals = {
        preBreak:'6:40–7:00', cardio:'7:00–7:30', breakfast:'7:30–8:00',
        lunch:'12:00–12:40', nap:'12:40–13:30', dinner:'18:00–18:40',
      };

      if(!ph){
        add(meals.preBreak,'早餐（轻食）','饮食');
        add(meals.cardio,'早起有氧','运动');
        add(meals.breakfast,'早餐','饮食');
        add('8:30–10:30','自由复习 / 查漏补缺','复盘');
        add('10:45–12:00','错题本回顾','复盘');
        add(meals.lunch,'午餐','饮食');
        add(meals.nap,'午休 30–40 分钟','休息');
        add('14:00–17:30','自主安排（阅读/专业课/项目）','自定义');
        add(meals.dinner,'晚餐（清淡）','饮食');
        add('19:00–21:30','政治/英语巩固（任选）','自定义');
        add('21:30–22:00','当日复盘','复盘');
        return tasks;
      }

      const key = ph.k;

      if(key==='p1'){
        add(meals.preBreak,'早餐（轻食：香蕉/酸奶）','饮食');
        add(meals.cardio,'早起有氧（RPE 5–6）','运动');
        add(meals.breakfast,'早餐（全麦+鸡蛋/牛奶）','饮食');

        add('8:00–8:20', pick(coreKaoan, idx), '政治');
        add('8:20–8:30','数学预热：昨日公式速览','数学');
        add('8:30–10:30', idx<30? pick(zhangyu30, idx): pick(lyl660_la, idx-30), '数学');
        add('10:30–10:45','积极休息（拉伸+补水）','休息');
        add('10:45–12:00', idx<30? `张宇《1000题》·配套第 ${idx+1} 讲（15题）` : `李永乐《基础660》·线代模块 ${idx-29}（15题）`, '数学');

        add(meals.lunch,'午餐（七分饱）','饮食');
        add(meals.nap,'午休 30–40 分钟','休息');

        add('14:00–14:30', pick(enJuju, idx), '英语');
        add('14:30–15:00', pick(enReadLogic, idx), '英语');
        add('15:00–15:50','健身房（力量：胸/背/腿循环）','运动');

        const isSig = idx % 2 === 0;
        const chapIdx = Math.floor(idx/2);
        add('16:00–17:30', isSig? pick(sigChaps, chapIdx): pick(digChaps, chapIdx), '专业课');
        add('17:30–18:00', isSig? '《信号与系统》：课后题（10–15题）' : '《数字电路》：课后题（10–15题）', '专业课');

        add(meals.dinner,'晚餐（清淡）','饮食');
        add('19:00–20:30', pick(xsr1000, idx), '政治');
        add('20:45–21:30', `错题整理：对应 ${((idx%16)+1)} 章`, '政治');
        add('21:30–22:00','当日复盘','复盘');
      }

      if(key==='p2'){
        add(meals.preBreak,'早餐（轻食）','饮食');
        add(meals.cardio,'有氧（RPE 6）','运动');
        add(meals.breakfast,'早餐（主餐）','饮食');

        add('8:00–8:30','政治背诵（故事化/关键词法）','政治');
        add('8:30–10:45', pick(zhangyu36, idx), '数学');
        add('11:00–12:00', pick(lylTrueImprove, idx), '数学');

        add(meals.lunch,'午餐','饮食');
        add(meals.nap,'午休 30–40 分钟','休息');

        const y = yearsEn[idx % yearsEn.length];
        add('14:00–15:00', `英一真题：${y} 年 Text 1–2（精读+翻译）`, '英语');
        add('15:00–15:50','健身房（力量+核心）','运动');

        add('16:00–18:00', (idx%2===0)? `《信号与系统》专题复盘` : `《数字电路》专题复盘`, '专业课');

        add(meals.dinner,'晚餐','饮食');
        add('19:00–20:30','政治二轮：错题回炉 + 新题 20–30 题','政治');
        add('20:30–21:30','政治真题选择题','政治');
        add('21:30–22:00','跨科复盘','复盘');
      }

      if(key==='p3'){
        add(meals.preBreak,'早餐（轻食）','饮食');
        add(meals.cardio,'有氧（轻）','运动');
        add(meals.breakfast,'早餐（主餐）','饮食');

        add('7:30–8:20', pick(enEssayFuncs, idx), '英语');
        add('8:20–8:50', `政治：${pick(xiao8, Math.floor(idx/4))}·要点背诵`, '政治');

        const yMath = yearsMath[idx % yearsMath.length];
        add('9:00–11:30', `数学真题（计时）：${yMath} 年整卷`, '数学');
        add('11:30–12:00','数学错题分类','数学');

        add(meals.lunch,'午餐','饮食');
        add(meals.nap,'午休 30–40 分钟','休息');

        const yEn = yearsEn[(idx+8) % yearsEn.length];
        add('14:00–16:00', `英语真题套卷：${yEn} 年`, '英语');
        add('16:10–16:40','健身房（拉伸）','运动');

        const isSig = idx % 2 === 0; const tIdx = Math.floor(idx/2);
        add('17:10–18:30', isSig? pick(sigTrue, tIdx): pick(digTrue, tIdx), '专业课');

        add('18:30–19:00','晚餐','饮食');
        add('19:30–21:00','政治：肖八 + 大题框架书写','政治');
        add('21:00–22:00','多科错题整理','复盘');
      }

      if(key==='p4'){
        add(meals.preBreak,'早餐（轻食）','饮食');
        add(meals.cardio,'有氧（或散步）','运动');
        add(meals.breakfast,'早餐（主餐）','饮食');

        add('7:30–8:30', pick(xiao4, Math.floor(idx/5)), '政治');
        const mz = idx < 8 ? zhangyu8set[idx] : (idx < 12 ? zhangyu4set[idx-8] : `真题错题回顾/预测题（第 ${idx-11} 天）`);
        add('8:40–11:40', mz, '数学');

        add(meals.lunch,'午餐','饮食');
        add(meals.nap,'午休 30–40 分钟','休息');

        const yEn2 = yearsEn[(idx+12)%yearsEn.length];
        add('14:10–17:10', `英语冲刺卷：${yEn2} 年 + 作文`, '英语');
        add('17:40–18:10','健身房（放松）','运动');

        add('18:10–18:40','晚餐','饮食');
        add('18:40–20:10','专业课：核心考点回顾','专业课');
        add('20:20–22:00','政治：肖四全套练习','政治');
        add('22:00–22:30','错题快速回顾','复盘');
      }

      return tasks;
    }

    // ====== 本地存储（按日期分键）======
    const k = (base, d) => `${base}:${d}`;
    const getChecks  = (d) => JSON.parse(localStorage.getItem(k('checks', d))  || '{}');
    const setChecks  = (d, v) => localStorage.setItem(k('checks', d), JSON.stringify(v));
    const getCustom  = (d) => JSON.parse(localStorage.getItem(k('custom', d))  || '[]');
    const setCustom  = (d, v) => localStorage.setItem(k('custom', d), JSON.stringify(v));
    const getMetrics = (d) => JSON.parse(localStorage.getItem(k('metrics', d)) || '{}');
    const setMetrics = (d, v) => localStorage.setItem(k('metrics', d), JSON.stringify(v));

    // ====== 倒计时 ======
    function renderCountdown(){
      const now = new Date();
      const diff = Math.ceil((EXAM_DATE - now) / (1000*60*60*24));
      $('#dCountdown').textContent = diff + ' 天';
    }

    // ====== 日历 & 任务渲染 ======
    let current = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let selected = (()=>{
      const saved = localStorage.getItem('lastSelectedDate');
      return saved ? parseYMD(saved) : new Date();
    })();

    const fmt = (d)=>fmtDate(d);

    function completionRate(date){
      const d = fmt(date);
      // 若有外部计划，则按外部任务数量计算完成度
      const extTasks = PLAN?.[d]?.tasks || [];
      const total = (extTasks.length || buildDayPlan(date).length) + getCustom(d).length;
      const done  = Object.values(getChecks(d)).filter(Boolean).length;
      return total ? Math.min(1, done/total) : 0;
    }

    function renderWeekdays(){
      const w = ['一','二','三','四','五','六','日'];
      const wrap = $('#weekdays'); wrap.innerHTML='';
      w.forEach(s=>{ const el=document.createElement('div'); el.className='wd'; el.textContent='周'+s; wrap.appendChild(el); });
    }

    function renderCalendar(){
      $('#monthLabel').textContent = `${current.getFullYear()} 年 ${current.getMonth()+1} 月`;
      const first = new Date(current.getFullYear(), current.getMonth(), 1);
      const startDay = (first.getDay()+6)%7;
      const wrap = $('#days'); wrap.innerHTML='';
      const daysInMonth = new Date(current.getFullYear(), current.getMonth()+1, 0).getDate();
      const totalCells = Math.ceil((startDay + daysInMonth)/7)*7;

      for(let i=0;i<totalCells;i++){
        const cell = document.createElement('div'); cell.className='day';
        const dayNum = i-startDay+1;
        const date = new Date(current.getFullYear(), current.getMonth(), dayNum);
        if(dayNum<=0 || dayNum>daysInMonth){ cell.classList.add('mute'); }
        else{
          cell.textContent = dayNum;
          if(fmt(date)===fmt(new Date())) cell.classList.add('today');
          if(fmt(date)===fmt(selected))   cell.classList.add('selected');
          const mini = document.createElement('div'); mini.className='mini';
          const bar = document.createElement('i'); mini.appendChild(bar); cell.appendChild(mini);
          bar.style.width = Math.round(completionRate(date)*100)+'%';
          cell.addEventListener('click', ()=>{
            selected = date;
            localStorage.setItem('lastSelectedDate', fmt(selected));
            renderCalendar(); renderTasks();
          });
        }
        wrap.appendChild(cell);
      }
    }

    function renderTasks(){
      if(!root) return;
      const dkey = fmt(selected);

      $('#currentDate').textContent = dkey;

      // —— 外部 JSON 优先 —— //
      const ext = PLAN?.[dkey] || null;
      const tasks = ext
        ? ext.tasks.map(t => ({ t: t.time, title: t.title, cat: t.category }))
        : buildDayPlan(selected);

      // 阶段名：先用外部的，没有再回退本地阶段
      const ph = getPhase(selected);
      $('#phaseName').textContent = ext?.phase || (ph ? ph.name : '自由复习/休整日');

      const list = $('#taskList'); list.innerHTML='';
      const checks = getChecks(dkey);

      tasks.forEach((it, idx)=>{
        const row = document.createElement('div'); row.className='task';
        const id = 't'+idx;
        row.innerHTML = `
          <div class="time">${it.t}</div>
          <div class="title">
            <input type="checkbox" id="${id}" ${checks[id]? 'checked':''}>
            <label for="${id}">${it.title}</label>
            <span class="cat">${it.cat}</span>
          </div>
          <div class="tag">${ext ? '外部计划' : '资料驱动'}</div>`;
        row.querySelector('input').addEventListener('change', (e)=>{
          checks[id]=e.target.checked; setChecks(dkey, checks); renderCalendar();
        });
        list.appendChild(row);
      });

      // 自定义任务列表
      renderCustom();
      // 评分 & 备注
      loadMetrics(); loadNotes();
    }

    function renderCustom(){
      const holder = $('#customList'); holder.innerHTML='';
      const dkey = fmt(selected);
      const arr = getCustom(dkey);
      const checks = getChecks(dkey);

      arr.forEach((it, i)=>{
        const id = 'c'+i;
        const row = document.createElement('div'); row.className='task';
        row.innerHTML = `
          <div class="time">${it.t||''}</div>
          <div class="title">
            <input type="checkbox" id="${id}" ${checks[id]? 'checked':''}>
            <label for="${id}">${it.title}</label>
            <span class="cat">${it.cat||'自定义'}</span>
          </div>
          <div class="tools">
            <button class="btn" data-act="up">↑</button>
            <button className="btn" data-act="down">↓</button>
            <button class="btn" data-act="del">删除</button>
          </div>`;
        row.querySelector('input').addEventListener('change', (e)=>{
          const map = getChecks(dkey); map[id]=e.target.checked; setChecks(dkey, map); renderCalendar();
        });
        row.querySelectorAll('button').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const list = getCustom(dkey);
            if(btn.dataset.act==='del'){ list.splice(i,1); }
            if(btn.dataset.act==='up'   && i>0){ const t=list[i-1]; list[i-1]=list[i]; list[i]=t; }
            if(btn.dataset.act==='down' && i<list.length-1){ const t=list[i+1]; list[i+1]=list[i]; list[i]=t; }
            setCustom(dkey, list); renderCustom(); renderCalendar();
          });
        });
        holder.appendChild(row);
      });
    }

    // 自定义任务：添加
    $('#addCustom').addEventListener('click', ()=>{
      const dkey = fmt(selected);
      const t = $('#cTime').value.trim();
      const title = $('#cTitle').value.trim();
      const cat = $('#cCat').value;
      if(!title){ alert('请输入任务标题'); return; }
      const arr = getCustom(dkey); arr.push({t, title, cat}); setCustom(dkey, arr);
      $('#cTime').value=''; $('#cTitle').value='';
      renderCustom(); renderCalendar();
    });

    // 评分 & 建议
    function loadMetrics(){
      const m = getMetrics(fmt(selected));
      $('#effScore').value    = m.eff ?? '';
      $('#stressScore').value = m.stress ?? '';
      updateSuggest();
    }
    function saveMetrics(){
      const dkey = fmt(selected);
      setMetrics(dkey, {
        eff: Number($('#effScore').value||0),
        stress: Number($('#stressScore').value||0)
      });
      updateSuggest();
    }
    function updateSuggest(){
      const eff = Number($('#effScore').value||0);
      const stress = Number($('#stressScore').value||0);
      $('#effSuggest').textContent = eff && eff<7 ? '次日减少 15% 任务量 + 增加 30–60 分钟休息' : '维持当前节奏，错题复盘优先';
      $('#stressSuggest').textContent = stress && stress>7 ? '加 20–30 分钟拉伸/有氧，降低题目难度' : '保持；睡前放松';
      const hint=$('#riskHint');
      if(eff && eff<7 && stress && stress>7){ hint.textContent='风险：效率低且压力高 → 建议 1 天调整期（轻量复盘+运动+早睡）'; hint.className='risk bad'; return;}
      if(eff && eff<7){ hint.textContent='效率偏低：适度减量 + 集中攻克单一卡点'; hint.className='risk warn'; return;}
      if(stress && stress>7){ hint.textContent='压力偏高：降低难度 + 增加运动/休息'; hint.className='risk warn'; return;}
      hint.textContent='状态良好：保持节奏，注意补水与睡眠'; hint.className='risk ok';
    }
    $('#effScore').addEventListener('input', saveMetrics);
    $('#stressScore').addEventListener('input', saveMetrics);

    // 备注
    function loadNotes(){ $('#notes').value = localStorage.getItem(k('notes', fmt(selected)))||''; }
    function saveNotes(){ localStorage.setItem(k('notes', fmt(selected)), $('#notes').value); }
    $('#notes').addEventListener('input', saveNotes);

    // 工具按钮
    $('#checkAll').addEventListener('click', ()=>{
      const dkey=fmt(selected);
      const checks = getChecks(dkey);
      $$('#taskList input[type="checkbox"]').forEach(el=>{ el.checked=true; checks[el.id]=true; });
      $$('#customList input[type="checkbox"]').forEach(el=>{ el.checked=true; checks[el.id]=true; });
      setChecks(dkey, checks); renderCalendar();
    });
    $('#uncheckAll').addEventListener('click', ()=>{
      const dkey=fmt(selected);
      const checks = getChecks(dkey);
      $$('#taskList input[type="checkbox"]').forEach(el=>{ el.checked=false; checks[el.id]=false; });
      $$('#customList input[type="checkbox"]').forEach(el=>{ el.checked=false; checks[el.id]=false; });
      setChecks(dkey, checks); renderCalendar();
    });
    $('#resetBtn').addEventListener('click', ()=>{
      if(!confirm('重置当前日期的所有记录（勾选/自定义/评分/笔记）？')) return;
      const dkey=fmt(selected);
      ['checks','custom','metrics','notes'].forEach(p=>localStorage.removeItem(k(p,dkey)));
      renderTasks(); renderCalendar();
    });
    $('#exportBtn').addEventListener('click', ()=>{
      const dkey=fmt(selected);
      const data = {
        date:dkey,
        phase: (PLAN?.[dkey]?.phase) || (getPhase(selected)?.name) || '自由复习',
        checks:getChecks(dkey), custom:getCustom(dkey), metrics:getMetrics(dkey),
        notes: localStorage.getItem(k('notes', dkey))||''
      };
      const txt = '【日期】'+data.date+'\n【阶段】'+data.phase+'\n【完成情况】'+JSON.stringify(data.checks, null, 2)
        +'\n【自定义任务】'+JSON.stringify(data.custom, null, 2)+'\n【效率/压力】'+JSON.stringify(data.metrics)
        +'\n【备注】\n'+data.notes;
      navigator.clipboard.writeText(txt).then(()=>alert('已复制今日记录到剪贴板')).catch(()=>{
        const w = window.open('', '_blank');
        w.document.write('<pre class="copy">'+txt.replace(/[&<>]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))+'</pre>');
      });
    });

    // 倒计时 & 月份导航
    $('#prevMonth').addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()-1, 1); renderCalendar(); });
    $('#nextMonth').addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()+1, 1); renderCalendar(); });

    // 初始化
    function init(){
      renderCountdown(); renderWeekdays(); renderCalendar(); renderTasks();
      const timer = setInterval(renderCountdown, 60*1000);
      return ()=>clearInterval(timer);
    }
    const clean = init();
    return ()=>clean && clean();
  }, []);

  // —— 页面结构 —— //
  return (
    <div className="study" ref={rootRef}>
      <header>
        <div className="wrap">
          <div className="topline">
            <div>
              <h1>资料驱动｜日历打卡</h1>
              <div className="sub">
                覆盖 <strong>2025-09-01</strong> 至 <strong>2025-12-20</strong> · 依据你的书目自动生成每日细化任务 · 本地离线保存
              </div>
            </div>
            <div className="kpi">
              <div className="card"><div>距离考试</div><div className="count" id="dCountdown">-- 天</div></div>
              <button className="btn" id="exportBtn">导出今日记录</button>
              <button className="btn" id="resetBtn">重置本日</button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="panel">
          <h2>📅 打卡日历</h2>
          <div className="content">
            <div className="cal">
              <div className="nav">
                <button className="btn" id="prevMonth">◀ 上月</button>
                <div className="muted" id="monthLabel">--</div>
                <button className="btn" id="nextMonth">下月 ▶</button>
              </div>
              <div className="grid" id="weekdays" />
              <div className="grid" id="days" />
              <div className="legend">
                <span><span className="dot" style={{background:'#3b82f6'}} /> 学习日程</span>
                <span><span className="dot" style={{background:'#10b981'}} /> 打卡完成</span>
                <span><span className="dot" style={{background:'#f59e0b'}} /> 临近考试</span>
              </div>
            </div>
          </div>

          <h2>📈 每日效率与压力</h2>
          <div className="content">
            <div className="metrics">
              <div className="box">
                <label>效率评分（1-10）</label>
                <input type="number" id="effScore" min="1" max="10" step="1" />
                <div className="small">建议：<span id="effSuggest">—</span></div>
              </div>
              <div className="box">
                <label>压力评分（1-10）</label>
                <input type="number" id="stressScore" min="1" max="10" step="1" />
                <div className="small">建议：<span id="stressSuggest">—</span></div>
              </div>
            </div>
            <div className="risk" id="riskHint">—</div>
          </div>
          <div className="footer">提示：效率 &lt; 7 → 次日减量 15% 并加休息；压力 &gt; 7 → 增加20–30分钟有氧/拉伸并降低题目难度。</div>
        </section>

        <section className="panel" style={{overflow:'hidden'}}>
          <h2>✅ 今日任务（<span id="phaseName">—</span>）</h2>
          <div className="content">
            <div className="tasks-head">
              <div className="muted">当前日期：<strong id="currentDate">—</strong></div>
              <div className="tools">
                <button className="btn" id="checkAll">一键全选</button>
                <button className="btn" id="uncheckAll">清空勾选</button>
              </div>
            </div>
            <div className="small" style={{margin:'8px 0'}}>
              说明：勾选、效率/压力评分、备注与自定义任务均会自动离线保存（localStorage）。
            </div>
            <div className="tasks" id="taskList" />
          </div>

          <h2>🧩 自定义任务</h2>
          <div className="content custom">
            <div className="row">
              <input id="cTime"  placeholder="时间 如 20:20–21:00" />
              <input id="cTitle" placeholder="任务标题 如 英语额外阅读 / 复盘笔记" />
              <select id="cCat">
                <option value="自定义">自定义</option>
                <option value="英语">英语</option>
                <option value="数学">数学</option>
                <option value="政治">政治</option>
                <option value="专业课">专业课</option>
                <option value="运动">运动</option>
                <option value="饮食">饮食</option>
                <option value="休息">休息</option>
              </select>
              <button className="btn" id="addCustom">添加</button>
            </div>
            <div id="customList" className="tasks" style={{marginTop:8}} />
          </div>

          <h2>📝 今日备注</h2>
          <div className="content">
            <textarea id="notes" placeholder="记录今日收获 3 条 / 错题 1-2 个 / 心态一句话" />
          </div>
        </section>
      </main>
    </div>
  );
}
