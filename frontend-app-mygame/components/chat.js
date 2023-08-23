import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Message from './message';

export default function Chat({ gameId }) {
  const [postsList, setPostsList] = useState([]);
  const [newPost, setNewPost] = useState('');

  const client = new W3CWebSocket(`ws://localhost:8000/ws/${gameId}/`);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/chat/api/?game=${gameId}`);
      const posts = await response.json();
      setPostsList(posts);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  useEffect(() => {
    fetchPosts();

    client.onopen = () => {
      console.log(`WebSocket Chat Client Connected: ${gameId}`);
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        addNewMessage(dataFromServer.message);
      }
    };
  }, [gameId]);

  const addNewMessage = (message) => {
    setPostsList((prevPostsList) => [message, ...prevPostsList]);
  };

  const handlePostChange = (e) => {
    setNewPost(e.target.value);
  };

  const handlePostSubmit = async () => {
    if (newPost.trim()) {
      await saveNewPost(newPost.trim());
      setNewPost('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePostSubmit();
    }
  };

  const saveNewPost = async (message) => {
    try {
      const response = await fetch('http://localhost:8000/chat/api/', {
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ message, game: gameId }),
      });
      const data = await response.json();
      client.send(
        JSON.stringify({
          type: 'send_message',
          message: data,
        })
      );
    } catch (error) {
      console.error('Error saving new post:', error);
    }
  };

  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg shadow sm:p-8 dark:border-gray-700">
      <div className="mb-6">
        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <label htmlFor="comment" className="sr-only">
            Your comment
          </label>
          <input
            id="comment"
            type="text"
            className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
            placeholder="Write a comment..."
            value={newPost}
            onKeyPress={handleKeyPress}
            onChange={handlePostChange}
          />
        </div>
        <button
          type="button"
          className="text-gray-300 bg-gray-800 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          onClick={handlePostSubmit}
        >
          Send
        </button>
      </div>
      <div className="max-h-64 sm:max-h-76 overflow-y-scroll">
        {postsList?.map((post, index) => (
          <Message key={index} post={post} />
        ))}
      </div>
    </div>
  );
}
