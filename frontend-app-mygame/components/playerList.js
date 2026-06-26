import { useState } from 'react';
import { useGameContext } from '../context/GameContext'
import useActionGuard from '../hooks/useActionGuard'

function PlayerCard({ player }) {
  const { gameState, setActivePlayerHandler, updateScore, isCreator } = useGameContext();
  const [ editing, setEditing ] = useState(false);
  const [ newScore, setNewScore ] = useState(player.score);
  const [ selectPlayer, selecting ] = useActionGuard(setActivePlayerHandler);

  // Define utility function to determine card color based on props
  const getCardColorClass = () => {
    if (player.is_active && gameState == 'SELECT_QUESTION') {
      return "bg-correct/15 border-correct/50 shadow-glow-green";
    } else if (player.is_responder) {
      return "bg-correct/15 border-correct/50 shadow-glow-green";
    } else if (player.answered) {
      return "bg-incorrect/15 border-incorrect/50";
    } else {
      return "border-transparent";
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
    <li className={`p-3 rounded-lg border transition-all ${getCardColorClass()}`}>
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
                className="input max-w-[8rem]"
                value={newScore}
                onChange={changeScoreHandler}
              />
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={updateScoreHandler}
              >
                save
              </button>
            </>
          : <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {player.username}
              </p>
            </div>
            <div className="inline-flex items-center font-display text-base font-bold text-cyan">
              {player.score}
            </div>
          </>
        }
        { isCreator && (
          <button
            type="button"
            className="btn-ghost p-2"
            onClick={editHandler}
          >
            <svg className="h-4 w-4 py-auto"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
        )}
        {isCreator && gameState === 'SELECT_ACTIVE_USER' && (
          <button className="btn-primary text-sm px-3 py-1 disabled:opacity-60 disabled:cursor-not-allowed" disabled={selecting} onClick={() => selectPlayer(player.user_id)}>
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
    <div className="card p-4 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-display text-xl font-bold text-ink">Players</h5>
      </div>
      {isCreator && gameState == 'SELECT_ACTIVE_USER' && (
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-display text-lg font-bold text-cyan">Select User</h6>
        </div>
      )}
      <div className="flow-root">
        <ul role="list" className="divide-y divide-brd">
          {players.map((player) => (
            <PlayerCard player={player} key={player.id}/>
          ))}
        </ul>
      </div>
    </div>
  )
}
