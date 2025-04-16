import React from 'react';

interface LineChartProps {
  data: Array<Record<string, any>>;
  index?: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: Record<string, (value: number) => string>;
}

export function LineChart({ 
  data, 
  index = 'name', 
  categories,
  colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
  valueFormatter = {}
}: LineChartProps) {
  if (!data || data.length === 0 || !categories || categories.length === 0) {
    return null;
  }

  const height = 300;
  const width = 800;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  
  // Find max value across all categories for scaling
  const maxValue = Math.max(
    ...data.flatMap(item => 
      categories.map(category => 
        typeof item[category] === 'number' ? item[category] : 0
      )
    ),
    1 // Ensure we have a non-zero value
  );
  
  // Create X coordinates based on number of data points
  const xStep = (width - padding.left - padding.right) / Math.max(data.length - 1, 1);
  
  // Create lines for each category
  const lines = categories.map((category, categoryIndex) => {
    const points = data.map((item, itemIndex) => {
      const x = padding.left + itemIndex * xStep;
      const rawValue = item[category];
      const value = typeof rawValue === 'number' ? rawValue : 0;
      const y = height - padding.bottom - (value / maxValue) * (height - padding.top - padding.bottom);
      return `${x},${y}`;
    }).join(' ');
    
    return {
      points,
      color: colors[categoryIndex % colors.length],
      category
    };
  });

  return (
    <div className="relative" style={{ width: '100%', height: height }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Y-axis */}
        <line 
          x1={padding.left} 
          y1={padding.top} 
          x2={padding.left} 
          y2={height - padding.bottom} 
          stroke="#CBD5E1" 
          strokeWidth={1} 
        />
        
        {/* X-axis */}
        <line 
          x1={padding.left} 
          y1={height - padding.bottom} 
          x2={width - padding.right} 
          y2={height - padding.bottom} 
          stroke="#CBD5E1" 
          strokeWidth={1} 
        />
        
        {/* Y-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => {
          const y = height - padding.bottom - tick * (height - padding.top - padding.bottom);
          return (
            <React.Fragment key={`y-tick-${tick}`}>
              <line 
                x1={padding.left - 5} 
                y1={y} 
                x2={padding.left} 
                y2={y} 
                stroke="#CBD5E1" 
                strokeWidth={1} 
              />
              <text 
                x={padding.left - 10} 
                y={y} 
                textAnchor="end" 
                dominantBaseline="middle" 
                fontSize={12} 
                fill="#64748B"
              >
                {(maxValue * tick).toFixed(0)}
              </text>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke="#E2E8F0" 
                strokeWidth={1} 
                strokeDasharray="4,4" 
              />
            </React.Fragment>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((item, i) => {
          const x = padding.left + i * xStep;
          return (
            <text 
              key={`x-label-${i}`}
              x={x} 
              y={height - padding.bottom + 20} 
              textAnchor="middle" 
              fontSize={12} 
              fill="#64748B"
            >
              {item[index]?.toString().substring(0, 10) || ''}
            </text>
          );
        })}
        
        {/* Draw lines for each category */}
        {lines.map((line, i) => (
          <React.Fragment key={`line-${i}`}>
            <polyline
              points={line.points}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
            />
            {/* Draw points */}
            {data.map((item, itemIndex) => {
              const x = padding.left + itemIndex * xStep;
              const rawValue = item[line.category];
              const value = typeof rawValue === 'number' ? rawValue : 0;
              const y = height - padding.bottom - (value / maxValue) * (height - padding.top - padding.bottom);
              
              return (
                <circle
                  key={`point-${line.category}-${itemIndex}`}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="white"
                  stroke={line.color}
                  strokeWidth={2}
                />
              );
            })}
          </React.Fragment>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4 gap-4">
        {categories.map((category, i) => (
          <div key={`legend-${i}`} className="flex items-center">
            <div 
              className="w-3 h-3 mr-2" 
              style={{ backgroundColor: colors[i % colors.length] }}
            ></div>
            <span className="text-sm text-gray-600">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 