import Cookies from 'js-cookie';
import {useRouter} from 'next/router'
import React, { useState } from 'react';

const GameForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [userCount, setUserCount] = useState(2);
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(file);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('max_player_count', userCount);
    formData.append('password', password);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/game/api/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
        },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        console.log('New game created:', data);
        router.push(`/game/${data.id}`);

      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl mb-8 text-white">Create Game</h1>
          <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-white">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="file" className="block text-sm font-medium text-white">
          File
        </label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-1 text-white"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="userCount" className="block text-sm font-medium text-white">
          User Count
        </label>
        <div className="flex items-center mt-1">
          <input
            type="range"
            id="userCount"
            min="2"
            max="8"
            value={userCount}
            onChange={(e) => setUserCount(parseInt(e.target.value))}
            className="w-full h-3 appearance-none rounded-md bg-indigo-500 outline-none"
          />
          <div className="ml-2 w-8 text-center text-white">{userCount}</div>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password for Game Room
        </label>
        <input
          type="text"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="border-2 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
      >
        Create Game
      </button>
    </form>
        </div>
      </div>
    </>
  );
};

export default GameForm;
