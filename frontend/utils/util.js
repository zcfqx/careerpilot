function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatSalary(min, max) {
  if (!min && !max) return '面议';
  if (min && max) return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`;
  if (min) return `${(min / 1000).toFixed(0)}K以上`;
  return `${(max / 1000).toFixed(0)}K以内`;
}

function getScoreColor(score) {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
}

function getTrendIcon(trend) {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
}

function getTrendColor(trend) {
  if (trend === 'up') return '#52c41a';
  if (trend === 'down') return '#ff4d4f';
  return '#999999';
}

module.exports = { formatDate, formatSalary, getScoreColor, getTrendIcon, getTrendColor };
