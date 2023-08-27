import { useGameContext } from '../context/GameContext'

export default function PlayerList() {
  const { gameState, players, setActivePlayerHandler, isCreator } = useGameContext();

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg mb-2 shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Players</h5>
      </div>
      {isCreator && gameState == 'SELECT_ACTIVE_USER' && (
        <div className="flex items-center justify-between mb-4">
          <h6 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Select User</h6>
        </div>
      )}
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
                {isCreator && gameState === 'SELECT_ACTIVE_USER' && (
                  <button
                    className="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded-md focus:outline-none hover:bg-blue-600"
                    onClick={() => setActivePlayerHandler(player.user_id)}
                  >
                    Select
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
