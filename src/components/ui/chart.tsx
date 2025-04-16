import React from 'react';

interface ChartProps {
  data: number[];
  labels?: string[];
  title: string;
  type?: 'line' | 'bar';
  height?: number;
  width?: number;
}

export function Chart({ 
  data, 
  labels = [], 
  title, 
  type = 'line', 
  height = 200, 
  width = 400 
}: ChartProps) {
  // This is a simplified chart component
  // In a production app, you would use a library like recharts, chart.js, etc.
  
  const max = Math.max(...data, 1);
  const normalizedData = data.map(value => (value / max) * 0.8);
  
  return (
    <div className="border rounded-md p-4 bg-background">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div 
        style={{ height, width }} 
        className="relative flex items-end mt-2 space-x-1"
      >
        {normalizedData.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${type === 'line' ? 'border-t-2 border-primary' : 'bg-primary rounded-sm'}`}
              style={{ 
                height: type === 'line' ? '2px' : `${value * 100}%`,
                marginTop: type === 'line' ? `${(1 - value) * 100}%` : '0'
              }}
            />
            {labels[index] && (
              <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                {labels[index]}
              </span>
            )}
          </div>
        ))}
        <div className="absolute left-0 top-0 h-full border-l border-border" />
        <div className="absolute bottom-0 left-0 w-full border-b border-border" />
      </div>
    </div>
  );
}

interface LineChartProps {
  data: number[];
  labels?: string[];
  title?: string;
  height?: number;
  width?: number;
  lineColor?: string;
  fillColor?: string;
}

export function LineChart({ 
  data, 
  labels = [], 
  title = 'Line Chart', 
  height = 200, 
  width = 400,
  lineColor = 'var(--color-primary)',
  fillColor = 'rgba(79, 70, 229, 0.1)'
}: LineChartProps) {
  // Simple line chart implementation
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (value / maxValue) * height * 0.9;
    return `${x},${y}`;
  }).join(' ');
  
  // Create the area below the line
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  
  return (
    <div className="border rounded-md p-4 bg-background">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div style={{ height, width }} className="relative">
        <svg width={width} height={height}>
          <polygon 
            points={areaPoints} 
            fill={fillColor} 
          />
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - (value / maxValue) * height * 0.9;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="white"
                stroke={lineColor}
                strokeWidth="1"
              />
            );
          })}
        </svg>
        {labels.length > 0 && (
          <div className="flex justify-between mt-2">
            {labels.map((label, index) => (
              <span key={index} className="text-xs text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
