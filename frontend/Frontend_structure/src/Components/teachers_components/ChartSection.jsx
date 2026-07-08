import React, { useState } from 'react';

const chartData = {
  attendance: { vals: [72, 85, 78, 91, 88, 82, 95, 87, 90, 84, 93, 88], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], color: 'var(--g1)', metric: '87.4%', label: 'Avg Attendance', trend: '+5.2%' },
  completion: { vals: [60, 68, 72, 75, 71, 80, 85, 82, 79, 88, 91, 89], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], color: '#3B82F6', metric: '78.2%', label: 'Completion Rate', trend: '+3.8%' }
};

export default function ChartSection() {
  const [activeTab, setActiveTab] = useState('attendance');
  const data = chartData[activeTab];
  const maxVal = Math.max(...data.vals);

  return (
    <div className="section-card">
      <div className="sec-header">
        <div className="sec-title"><i className="fa-solid fa-chart-simple"></i> Teaching Analytics</div>
        <div className="tab-row">
          {Object.keys(chartData).map(key => (
            <button 
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>{data.metric}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{data.label}</div>
        </div>
      </div>

      <div className="chart-container">
        {data.vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div 
              className="bar" 
              style={{ 
                height: `${(v / maxVal) * 100}%`, 
                background: data.color, 
                width: '80%',
                opacity: i === data.vals.length - 1 ? 1 : 0.55 
              }}
            >
              <span className="bar-label">{data.labels[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
