export default function Menu() {
  return (
    <>
      <div class="container mx-auto px-4">
        <div class="flex flex-col items-center justify-center h-screen">
          <h1 class="text-4xl mb-8 text-white">Game Menu</h1>
          <a href="/game/create" class="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded mb-4 w-48">Create Game</a>
          <a href="/game/1" class="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded w-48">Connect</a>
        </div>
      </div>
    </>
  )
}
