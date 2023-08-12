
export default function PlayerList(props) {
  const { players } = props;

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Players</h5>
      </div>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {players.map((player) => (
            <li key={player.id} className="py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img className="w-8 h-8 rounded-full" src={player.profile_image} alt={player.username}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {player.username}
                  </p>
                </div>
                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                  {player.score}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
