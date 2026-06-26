import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Message from './message';

export default function Chat({ gameId }) {
  const [postsList, setPostsList] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);

  // Hold a single WebSocket per gameId. Created in the effect below (not in the
  // component body) so re-renders don't spawn new sockets and leak connections.
  const clientRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/chat/api/?game=${gameId}`);
      const posts = await response.json();
      setPostsList(posts);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  useEffect(() => {
    fetchPosts();

    const client = new W3CWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/${gameId}/`);
    clientRef.current = client;

    client.onopen = () => {
      console.log(`WebSocket Chat Client Connected: ${gameId}`);
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        addNewMessage(dataFromServer.message);
      }
    };

    return () => {
      clientRef.current = null;
      client.close();
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

  const toggleChat = () => {
    setIsChatCollapsed(!isChatCollapsed);
  };

  const saveNewPost = async (message) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/chat/api/`, {
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ message, game: gameId }),
      });
      const data = await response.json();
      clientRef.current?.send(
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
    <div className="card p-4">
      <button
        type="button"
        className="btn-ghost text-sm mb-4"
        onClick={toggleChat}
      >
        {isChatCollapsed ? 'Expand Chat' : 'Collapse Chat'}
      </button>
      <div className={`${isChatCollapsed ? 'hidden' : 'block'}`}>
        <div className="mb-4">
          <div className="mb-4 card p-2 bg-surface-2">
            <label htmlFor="comment" className="sr-only">
              Your comment
            </label>
            <input
              id="comment"
              type="text"
              className="input border-0 bg-transparent focus:ring-0"
              placeholder="Write a comment..."
              value={newPost}
              onKeyPress={handleKeyPress}
              onChange={handlePostChange}
            />
          </div>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={handlePostSubmit}
            >
            Send
          </button>
        </div>
        <div className="max-h-64 sm:max-h-76 overflow-y-scroll space-y-2">
          {postsList?.map((post, index) => (
            <Message key={index} post={post} />
            ))}
        </div>
      </div>
    </div>
  );
}
