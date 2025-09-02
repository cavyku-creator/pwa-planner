import { useState } from 'react';
import StudyDashboard from './components/StudyDashboard';
import WorkoutPlan from './components/WorkoutPlan';

export default function App() {
  const [view, setView] = useState(localStorage.getItem('view') || 'study');
  const switchTo = (v) => { setView(v); localStorage.setItem('view', v); };

  return (
    <>
      {view === 'study' ? <StudyDashboard /> : <WorkoutPlan />}

      {/* 右下角切换按钮 */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 10000 }}>
        {view === 'study' ? (
          <button className="btn" onClick={() => switchTo('workout')}>切换到：运动计划</button>
        ) : (
          <button className="btn" onClick={() => switchTo('study')}>返回：学习计划</button>
        )}
      </div>
    </>
  );
}
