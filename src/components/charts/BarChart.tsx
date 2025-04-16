import React from 'react';

interface BarChartProps {
  data: Array<Record<string, any>>;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: Record<string, (value: number) => string>;
}

export function BarChart({ 
  data, 
  index, 
  categories,
  colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
  valueFormatter = {}
}: BarChartProps) {
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
  
  const barCount = data.length * categories.length;
  const availableWidth = width - padding.left - padding.right;
  // Calculate bar width allowing for some space between groups
  const barGroupWidth = availableWidth / data.length;
  const barWidth = (barGroupWidth * 0.8) / categories.length; // 80% of available width
  const barSpacing = barGroupWidth * 0.2 / (categories.length + 1); // Space between bars

  // Format value for display
  const formatValue = (category: string, value: number): string => {
    if (valueFormatter && valueFormatter[category]) {
      return valueFormatter[category](value);
    }
    return value.toString();
  };

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
          const x = padding.left + i * barGroupWidth + barGroupWidth / 2;
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
        
        {/* Draw bars for each category */}
        {data.map((item, itemIndex) => (
          <React.Fragment key={`bargroup-${itemIndex}`}>
            {categories.map((category, categoryIndex) => {
              const rawValue = item[category];
              const value = typeof rawValue === 'number' ? rawValue : 0;
              const barHeight = (value / maxValue) * (height - padding.top - padding.bottom);
              
              const barX = padding.left + itemIndex * barGroupWidth + barSpacing * (categoryIndex + 1) + barWidth * categoryIndex;
              const barY = height - padding.bottom - barHeight;
              
              return (
                <React.Fragment key={`bar-${itemIndex}-${categoryIndex}`}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={colors[categoryIndex % colors.length]}
                    rx={2}
                  />
                  
                  {/* Value label on top of bar */}
                  {barHeight > 30 && (
                    <text
                      x={barX + barWidth / 2}
                      y={barY + 15}
                      textAnchor="middle"
                      fontSize={10}
                      fill="white"
                    >
                      {formatValue(category, value)}
                    </text>
                  )}
                </React.Fragment>
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