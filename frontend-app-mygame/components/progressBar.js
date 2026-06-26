export default function ProgressBar({ max, current }) {
  const widthPercentage = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="timerbar mb-4">
      <div className="timerbar__fill" style={{ width: `${widthPercentage}%` }}></div>
    </div>
  );
}
