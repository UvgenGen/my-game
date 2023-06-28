export default function Header() {
  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Game</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="hover:text-gray-400">
                Home
              </a>
            </li>
            <li>
              <a href="/logout/" className="hover:text-gray-400">
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
