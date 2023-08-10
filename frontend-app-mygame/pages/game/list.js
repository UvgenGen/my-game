import React, { useState } from 'react';


export default function GameList(context) {
    const { games } = context;
    console.log(games);
    return (
      <>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl mb-8 text-white">Game list</h1>

            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            id
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Max players
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        // <a href={`/game/${game.id}`} key={game.id} className="bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded mb-4 w-48">{game.title}</a>
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class="px-6 py-4">
                                {game.id}
                            </td>
                            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {game.title}
                            </th>
                            <td class="px-6 py-4">
                                {game.max_player_count}
                            </td>
                            <td class="px-6 py-4">
                                <a href={`/game/${game.id}`} class="font-medium text-blue-600 dark:text-blue-500 hover:underline">connect</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

          </div>
        </div>
      </>
    )
}


export async function getServerSideProps({ params }) {
    const res = await fetch(`http://web:8000/game/api`);
    const games = await res.json();
    return { props: { games } }
}