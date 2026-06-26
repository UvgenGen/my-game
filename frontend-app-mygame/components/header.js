export default function Header() {
  return (
    <header className="bg-surface/80 backdrop-blur border-b border-brd">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <a href="/" className="font-display text-2xl font-bold text-cyan [text-shadow:0_0_12px_rgba(45,212,255,.6)]">
          My&nbsp;Game
        </a>
        <nav>
          <ul className="flex items-center space-x-3">
            <li><a href="/" className="text-muted hover:text-cyan transition-colors">Home</a></li>
            <li><a href="/logout/" className="btn-ghost text-sm">Logout</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
