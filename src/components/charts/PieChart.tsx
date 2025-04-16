import React from 'react';

interface PieChartProps {
  data: Array<Record<string, any>>;
  category: string;
  index: string;
  colors?: string[];
}

export function PieChart({ 
  data, 
  category,
  index,
  colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#D946EF']
}: PieChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(centerX, centerY) * 0.8;
  
  // Calculate total value for percentage
  const total = data.reduce((sum, item) => {
    const value = typeof item[category] === 'number' ? item[category] : 0;
    return sum + value;
  }, 0);
  
  if (total === 0) {
    return (
      <div className="flex justify-center items-center" style={{ height: size }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Create pie segments
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const value = typeof item[category] === 'number' ? item[category] : 0;
    const percentage = (value / total) * 100;
    const angleSize = (percentage / 100) * 2 * Math.PI;
    
    // Start and end angles
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSize;
    
    // Calculate SVG arc path
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    // Determine if the arc should take the long path around (large-arc-flag)
    const largeArcFlag = angleSize > Math.PI ? 1 : 0;
    
    // Create the SVG path
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
    
    // For label positioning, calculate a point halfway along the arc
    const labelAngle = startAngle + angleSize / 2;
    const labelRadius = radius * 0.65; // Position label inside the segment
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    
    // Save the ending angle for the next segment
    currentAngle = endAngle;
    
    return {
      path,
      color: colors[index % colors.length],
      value,
      percentage,
      labelX,
      labelY,
      name: item[index]
    };
  });

  return (
    <div className="relative" style={{ width: '100%', height: size }}>
      <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Render pie segments */}
        {segments.map((segment, i) => (
          <path
            key={`segment-${i}`}
            d={segment.path}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
        
        {/* Render percentage labels when there's enough space */}
        {segments.map((segment, i) => (
          segment.percentage > 5 && (
            <text
              key={`label-${i}`}
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#fff"
              fontWeight="bold"
            >
              {`${segment.percentage.toFixed(1)}%`}
            </text>
          )
        ))}
      </svg>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {segments.map((segment, i) => (
          <div key={`legend-${i}`} className="flex items-center">
            <div 
              className="w-3 h-3 mr-2 flex-shrink-0" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-sm text-gray-600 truncate" title={segment.name}>
              {segment.name?.toString().substring(0, 18) || ''} ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 