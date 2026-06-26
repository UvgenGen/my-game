export default function Menu() {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="font-display text-5xl font-bold mb-2 text-ink">Game Menu</h1>
        <p className="text-muted mb-10">Buzz in. Outsmart your friends.</p>
        <div className="flex flex-col gap-4 w-64">
          <a href="/game/create" className="btn-primary text-lg py-3">Create Game</a>
          <a href="/game/list" className="btn-primary text-lg py-3">Play with friends</a>
        </div>
      </div>
    </div>
  );
}
