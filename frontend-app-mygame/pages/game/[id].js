import { useEffect, useState } from "react";
import Chat from '../../components/chat';


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
    <div className="m-1 sm:m-5 md:m-7 h-screen">
      <div className="flex justify-between items-center mb-6">
      </div>
      <div class="mx-auto grid max-w-8xl grid-cols-12 gap-4 p-1">
        <div class="col-span-12 rounded-lg border border-gray-400 py-1">
          {players.map((player) => (
            <div key={player.id} className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src={player.profile_image} alt=""/>
              <div className="text-center">{player.username}</div>
              <div className="text-center">{player.score}</div>
            </div>
          ))}
        </div>
        <div class="col-span-12 rounded-lg border border-gray-400 p-1 sm:col-span-8">
          <table className="min-w-full">
            <tbody>
              {roundData?.themes?.map((theme, themeIndex) => (
                <tr className="bg-gray-100 border-b" key={themeIndex}>
                  <td className="text-xs tracking-tighter text-gray-900 font-light p-2 whitespace-nowrap">
                    {theme.name}
                  </td>
                  {theme.questions.map((question, index) => (
                    <td
                      key={index}
                      className="text-xs tracking-tighter text-gray-900 font-light p-2 whitespace-nowrap"
                    >
                      {question.price}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div class="col-span-12 rounded-lg border border-gray-400 p-1 sm:col-span-4">
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
