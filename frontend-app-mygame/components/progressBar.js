export default function ProgressBar({ max, current }) {
  const widthPercentage = (current / max) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
      <div className="bg-gray-600 h-2.5 rounded-full dark:bg-gray-300" style={{ width: `${widthPercentage}%` }}></div>
    </div>
  );
};
