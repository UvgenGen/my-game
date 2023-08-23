export default function Menu() {
  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl mb-8 text-white">Game Menu</h1>
          <a href="/game/create" className="border-2 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200 py-2 px-4 mb-4 w-48">Create Game</a>
          <a href="/game/list" className="border-2 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200 py-2 px-4 mb-4 w-48">Play with friends</a>
        </div>
      </div>
    </>
  )
}
