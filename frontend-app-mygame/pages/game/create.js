import Cookies from 'js-cookie';
import {useRouter} from 'next/router'
import React, { useState } from 'react';

const GameForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [userCount, setUserCount] = useState(2);
  const [password, setPassword] = useState('');
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform form submission or API call with the form data
    // For example:
    const formData = {
      title: title,
      data: {test: 123},
      max_player_count: userCount,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:8000/game/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken')
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Request was successful
        const data = await response.json();
        console.log('New game created:', data);
        router.push(`/game/${data.id}`);

      } else {
        // Request failed
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    console.log(formData);
  };

  return (
    <>
      <div class="container mx-auto px-4">
        <div class="flex flex-col items-center justify-center h-screen">
          <h1 class="text-4xl mb-8 text-white">Create Game</h1>
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
        className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
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
