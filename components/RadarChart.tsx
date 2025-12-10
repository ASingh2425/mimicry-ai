import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { StyleMetrics } from '../types';

interface Props {
  metrics: StyleMetrics;
}

const StyleRadarChart: React.FC<Props> = ({ metrics }) => {
  const data = [
    { subject: 'Creativity', A: metrics.creativity, fullMark: 100 },
    { subject: 'Technicality', A: metrics.technicality, fullMark: 100 },
    { subject: 'Conciseness', A: metrics.conciseness, fullMark: 100 },
    { subject: 'Vocabulary', A: metrics.vocabulary, fullMark: 100 },
    { subject: 'Emotion', A: metrics.emotion, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Style Fingerprint"
            dataKey="A"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="#38bdf8"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#38bdf8' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StyleRadarChart;