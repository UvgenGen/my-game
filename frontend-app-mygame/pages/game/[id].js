import { useEffect, useState } from "react";
import Chat from '../../components/chat';
import GameBoard from '../../components/game_bard';
import PlayerList from '../../components/player_list';


export default function Game(context) {
  const { posts, game, id } = context;
  const [activeRound, setActiveRound] = useState(0);
  const [roundData, setRoundData] = useState([]);
  const [roundName, setRoundName] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    setActiveRound(game.active_round);
    setRoundData(game.data[activeRound]);
    setRoundName(roundData.name);
    setPlayers(game.players);
  }, [])


  return (
    <div className="m-1 sm:m-5 md:m-7">
      <div className="flex justify-between items-center mb-6">
      </div>
      <div class="mx-auto grid max-w-8xl grid-cols-12 gap-4 p-1">
        <div class="col-span-12 rounded-lg border border-gray-400 p-1 sm:col-span-8">
          <GameBoard roundData={roundData}/>
        </div>
        <div class="col-span-12 sm:col-span-4">
          <PlayerList players={players}/>
          <Chat posts={posts} room={id} />
        </div>
      </div>
    </div>
  )
}


export async function getServerSideProps({ params }) {
  const posts_response = await fetch(`http://web:8000/chat/api/?game=${params.id}`);
  const posts = await posts_response.json();
  const game_response = await fetch(`http://web:8000/game/api/${params.id}`);
  const game = await game_response.json();
  return { props: { posts, game, id: params.id} }
}
