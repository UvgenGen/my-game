import Cookies from 'js-cookie';
import { useEffect, useState } from "react";
import Message from './message';
import { w3cwebsocket as W3CWebSocket } from "websocket";


export default function Chat(props) {
  const { posts, room } = props;
  const [postsList, setPosts] = useState(posts);
  const [post, setPost] = useState('');

  const client = new W3CWebSocket('ws://localhost:8000/ws/' + room + '/');

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        addPost(dataFromServer.message);
      }
    };
  }, [])

  const addPost = (post) => {
      console.log(postsList);
      setPosts([post].concat(postsList));
      posts.unshift(post);
  }

  const changePostHandler = (e) => {
    setPost(e.target.value);
  }

  const submitPostHandler = (e) => {
    const savePost = async (newPost) => {
      await fetch("http://localhost:8000/chat/api/",
      {
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({'message': newPost, 'game': room})
      })
      .then((response) => response.json())
      .then((data) => {
        client.send(
          JSON.stringify({
            type: "message",
            message: data,
          })
        );
      });
    };
    if (post.length) {
      savePost(post);
      setPost('');
    };
  };

  return (
    <>
      <div className="mb-6">
        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <input
            id="comment"
            type="text"
            className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
            placeholder="Write a comment..."
            value={post}
            onChange={changePostHandler}
          />
        </div>
        <button
          type="submit"
          className="text-gray-300 bg-gray-800 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          onClick={submitPostHandler}
        >
          Send
        </button>
      </div>
      <div className="max-h-96 overflow-y-scroll">
        {postsList?.map((post) => Message(post))}
      </div>
    </>
  )
}
