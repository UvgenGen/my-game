export default function GameList(context) {
    const { games } = context;
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center min-h-[80vh] pt-16">
          <h1 className="font-display text-4xl font-bold mb-8 text-ink">Game List</h1>
          <div className="w-full max-w-3xl card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted bg-surface-2 border-b border-brd">
                <tr>
                  <th scope="col" className="px-6 py-3">id</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Players</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-brd hover:bg-surface-2 transition-colors">
                    <td className="px-6 py-4 text-muted">{game.id}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-ink whitespace-nowrap">{game.title}</th>
                    <td className="px-6 py-4 text-muted">{game.players.length}/{game.max_player_count}</td>
                    <td className="px-6 py-4">
                      <a href={`/game/${game.id}`} className="font-medium text-cyan hover:[text-shadow:0_0_10px_rgba(45,212,255,.7)]">connect</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}


export async function getServerSideProps({ params }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_INTERNAL_WEB_URL}/game/api`);
    const games = await res.json();
    return { props: { games } }
}