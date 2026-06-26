import { useGameContext } from '../context/GameContext'
import useActionGuard from '../hooks/useActionGuard'


function PlayerBar() {
  const { answerHandler } = useGameContext();
  const [buzz, busy] = useActionGuard(answerHandler, 1500);
  return (
    <div className="card p-4 mb-2">
      <button
        type="button"
        className="btn-buzz disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={buzz}
        disabled={busy}
      >
        Buzz
      </button>
    </div>
  );
}

const RoundSelector = () => {
  const { gameData, activeRound, setRoundHandler } = useGameContext();
  return (
    <select id="selectField" name="selectField" className="input" value={activeRound} onChange={setRoundHandler}>
      {gameData?.map((round, index) => (
        <option key={index} value={index} className="bg-surface text-ink">{round.name}</option>
      ))}
    </select>
  );
};

function CreatorBar() {
  return (
    <div className="card p-4 mb-2">
      <label className="block text-xs uppercase tracking-wide text-muted mb-2">Round</label>
      <RoundSelector/>
    </div>
  );
}

export default function GameBar() {
  const { isCreator } = useGameContext();

  if (isCreator) {
    return <CreatorBar/>
  } else {
    return <PlayerBar/>
  }
}
