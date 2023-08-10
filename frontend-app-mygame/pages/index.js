export default function Menu() {
  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl mb-8 text-white">Game Menu</h1>
          <a href="/game/create" className="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded mb-4 w-48">Create Game</a>
          <a href="/game/list" className="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded mb-4 w-48">Play with friends</a>
        </div>
      </div>
    </>
  )
}
