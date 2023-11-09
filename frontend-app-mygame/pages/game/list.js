export default function GameList(context) {
    const { games } = context;

    return (
      <>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl mb-8 text-white">Game list</h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                id
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Players
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((game) => (
                            // <a href={`/game/${game.id}`} key={game.id} className="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded mb-4 w-48">{game.title}</a>
                            <tr key={game.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">
                                    {game.id}
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {game.title}
                                </th>
                                <td className="px-6 py-4">
                                    {game.players.length}/{game.max_player_count}
                                </td>
                                <td className="px-6 py-4">
                                    <a href={`/game/${game.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">connect</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </>
    )
}


export async function getServerSideProps({ params }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_INTERNAL_WEB_URL}/game/api`);
    const games = await res.json();
    return { props: { games } }
}