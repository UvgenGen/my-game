import { useEffect, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Chat from '../../components/chat';
import GameBoard from '../../components/gameBoard';
import PlayerList from '../../components/playerList';


export default function Game(context) {
  const { posts, gameId } = context;
  const [activeRound, setActiveRound] = useState(0);
  const [roundData, setRoundData] = useState([]);
  const [roundName, setRoundName] = useState('');
  const [players, setPlayers] = useState([]);

  const client = new W3CWebSocket('ws://localhost:8000/ws/game/' + gameId + '/');

  useEffect(() => {
    client.onopen = () => {
      console.log(`WebSocket Game Client Connected: ${gameId}`);
    };
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        console.log(dataFromServer);
      }
    };
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const game_response = await fetch(`http://localhost:8000/game/api/${gameId}`);
        const game = await game_response.json();

        setActiveRound(game.active_round);
        setRoundData(game.data[game.active_round]);
        setRoundName(game.data[game.active_round].name);
        setPlayers(game.players);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchData();
  }, [activeRound])

  const showQuestionHandler = (e) => {
    console.log('setActivePlayerHandler')
    client.send(
      JSON.stringify({
        type: "show_question",
        round_id: activeRound,
        question_id: 1,
        theme_id: 1,
      })
    );
  };

  return (
    <div className="m-1 sm:m-5 md:m-7">
      <button onClick={showQuestionHandler}>test</button>
      <div className="mx-auto grid max-w-8xl grid-cols-12 gap-4 p-1">
        <div className="col-span-12 rounded-lg border border-gray-400 p-1 sm:col-span-8">
          <GameBoard roundData={roundData}/>
        </div>
        <div className="col-span-12 sm:col-span-4">
          <PlayerList players={players}/>
          <Chat posts={posts} gameId={gameId} />
        </div>
      </div>
    </div>
  )
}


export async function getServerSideProps({ params }) {
  const posts_response = await fetch(`http://web:8000/chat/api/?game=${params.id}`);
  const posts = await posts_response.json();
  return { props: { posts, gameId: params.id} }
}
