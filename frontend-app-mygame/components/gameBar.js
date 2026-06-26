import { useGameContext } from '../context/GameContext'


function PlayerBar() {
  const { answerHandler } = useGameContext();
  return (
    <div className="card p-4 mb-2">
      <button type="button" className="btn-buzz" onClick={() => answerHandler()}>
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
