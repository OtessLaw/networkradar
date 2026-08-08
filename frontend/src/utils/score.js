export function getStatusLabel(status) {
  const labels = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    critical: 'Critical',
    insufficient_data: 'Not enough data'
  };
  return labels[status] || 'Unknown';
}

export function getStatusColor(status) {
  const colors = {
    excellent: 'text-emerald-400',
    good: 'text-green-400',
    fair: 'text-amber-400',
    poor: 'text-red-400',
    critical: 'text-red-700',
    insufficient_data: 'text-gray-400'
  };
  return colors[status] || 'text-gray-400';
}

export function getStatusBg(status) {
  const colors = {
    excellent: 'bg-emerald-500',
    good: 'bg-green-500',
    fair: 'bg-amber-500',
    poor: 'bg-red-500',
    critical: 'bg-red-800',
    insufficient_data: 'bg-gray-600'
  };
  return colors[status] || 'bg-gray-600';
}

export function getConfidenceLabel(confidence) {
  const labels = {
    insufficient: 'Insufficient',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High'
  };
  return labels[confidence] || 'Unknown';
}
