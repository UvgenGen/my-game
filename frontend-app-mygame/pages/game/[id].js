import Chat from '../../components/chat';
import GameBoard from '../../components/gameBoard';
import PlayerList from '../../components/playerList';
import { GameProvider, useGameContext } from '../../context/GameContext'


function Game() {
  const { gameId } = useGameContext();

  return (
    <div className="m-1 sm:m-5 md:m-7">
      <div className="mx-auto grid max-w-8xl grid-cols-12 gap-4 p-1">
        <div className="col-span-12 rounded-lg border border-gray-400 p-1 sm:col-span-8">
          <GameBoard/>
        </div>
        <div className="col-span-12 sm:col-span-4">
          <PlayerList/>
          <Chat gameId={gameId} />
        </div>
      </div>
    </div>
  )
}

export default function GamePage(context) {
  const { gameId } = context;
  return (
    <GameProvider gameId={gameId}>
      <Game/>
    </GameProvider>
  );
}


export async function getServerSideProps({ params }) {
  return { props: { gameId: params.id } }
}
