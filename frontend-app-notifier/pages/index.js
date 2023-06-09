import Cookies from 'js-cookie';
import { useEffect, useState } from "react";
import io from 'Socket.IO-client';

let socket;


function Message(context) {
  const {id, message, user, publish_date: date} = context;
  return (
    <>
      <div className="p-6 mb-6 text-base bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900" key={id}>
        <footer className="flex justify-between items-center mb-2">
            <div className="flex items-center">
                <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white"><img
                        className="mr-2 w-10 h-10 rounded-full"
                        src={user?.profile_image_url}
                        alt={user.username}/>{user.username}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
            </div>
            <button
                className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-400 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                type="button">
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z">
                    </path>
                </svg>
                <span className="sr-only">Comment settings</span>
            </button>
        </footer>
        <p className="text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{__html: message.replace(/\n/g, "<br />")}}/>
      </div>
    </>
  )
}

export default function Home(context) {
  const { posts } = context;
  const [postsList, setPosts] = useState(posts);
  const [post, setPost] = useState('');

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('http://localhost:3000/api/socket');
      socket = io('http://localhost:3000');
  
      socket.on('connect', () => {
        console.log('connected');
      });
      socket.on('update-posts', res => {
        addPost(res);
      });
    }
    socketInitializer();
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
      await fetch("http://localhost:8000/api/posts/",
      {
          headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({'message': newPost})
      })
      .then((response) => response.json())
      .then((data) => {
        socket.emit('post-add', data);
        addPost(data);
      });
    }
    if (post.length) {
      savePost(post);
      setPost('');
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="mb-6">
            <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <label for="comment" className="sr-only">Your comment</label>
              <textarea id="comment" rows="6"
                className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                placeholder="Write a comment..."
                value={post}
                onChange={changePostHandler}
              ></textarea>
            </div>
            <button type="submit"
              className="text-gray-300 bg-gray-800 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={submitPostHandler}
            >
              Post comment
            </button>
        </div>
        { postsList?.map((post)=>Message(post))}
      </div>
    </>
  )
}


export async function getServerSideProps() {
  const res = await fetch(`http://web:8000/api/posts/`);
  const posts = await res.json();
  return { props: { posts } }
}