import { useGameContext } from '../context/GameContext'


function PlayerBar() {
  const { answerHandler } = useGameContext();
  return (
    <div className="w-full p-2 bg-white border border-gray-200 rounded-lg mb-2 shadow sm:p-4 dark:bg-gray-800 dark:border-gray-700">
      <button
        className="h-10 w-32 bg-red-500 active:bg-red-600  rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
        type="button"
        onClick={() => answerHandler()}
      >
      </button>
    </div>
  )
}

const RoundSelector = () => {
  const { gameData, activeRound, setRoundHandler } = useGameContext();

  return (
    <div className="mt-4">
      <select
        id="selectField"
        name="selectField"
        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-300 focus:border-indigo-300"
        value={activeRound}
        onChange={setRoundHandler}
      >
        { gameData?.map((round, index) => (
          <option key={index} value={index}>{round.name}</option>
        )) }
      </select>
    </div>
  );
};

function CreatorBar() {

  return (
    <div className="w-full p-2 bg-white border border-gray-200 rounded-lg mb-2 shadow sm:p-4 dark:bg-gray-800 dark:border-gray-700">
      <RoundSelector/>
    </div>
  )
}

export default function GameBar() {
  const { isCreator } = useGameContext();

  if (isCreator) {
    return <CreatorBar/>
  } else {
    return <PlayerBar/>
  }
}
