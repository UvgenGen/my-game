import { useState } from 'react';
import { useGameContext } from '../context/GameContext'

function PlayerCard({ player }) {
  const { gameState, setActivePlayerHandler, updateScore, isCreator } = useGameContext();
  const [ editing, setEditing ] = useState(false);
  const [ newScore, setNewScore ] = useState(player.score);

  // Define utility function to determine card color based on props
  const getCardColorClass = () => {
    if (player.is_active && gameState == 'SELECT_QUESTION') {
      return "bg-green-900";
    } else if (player.is_responder) {
      return "bg-green-900";
    } else if (player.answered) {
      return "bg-red-900";
    } else {
      return "";
    }
  };

  const editHandler = () => {
    setEditing(!editing);
  }

  const changeScoreHandler = (e) => {
    setNewScore(e.target.value);
  }
  
  const updateScoreHandler = () => {
    updateScore(player.id, newScore);
    editHandler();
  }

  return (
    <li className={`p-3 rounded-md ${getCardColorClass()}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img className="w-8 h-8 rounded-full" src={player.profile_image} alt={player.username}/>
        </div>
        { editing
          ?
            <>
              <input
                type="number"
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
                value={newScore}
                onChange={changeScoreHandler}
              />
              <button
                type="button"
                className="text-gray-300 mb-4 bg-gray-800 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={updateScoreHandler}
              >
                save
              </button>
            </>
          : <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                {player.username}
              </p>
            </div>
            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
              {player.score}
            </div>
          </>
        }
        { isCreator && (
          <button
            type="button"
            className="text-gray-300 mb-4 bg-gray-800 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            onClick={editHandler}
          >
            <svg className="h-4 w-4 py-auto text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        )}
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
  )
}

export default function PlayerList() {
  const { gameState, players, isCreator } = useGameContext();

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
            <PlayerCard player={player} key={player.id}/>
          ))}
        </ul>
      </div>
    </div>
  )
}
