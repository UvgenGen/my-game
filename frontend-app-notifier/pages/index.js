import Cookies from 'js-cookie';
import { useEffect, useState } from "react";
import io from 'Socket.IO-client'

let socket


function Message(context) {
  const {id, message, user, publish_date: date} = context;
  return (
    <div className="card mb-4" key={id}>
      <div className="card-body">
        <p>{message}</p>

        <div className="d-flex justify-content-between">
          <div className="d-flex flex-row align-items-center">
            <img src={user?.profile_image_url} alt="avatar" width="25"
              height="25" />
            <p className="small mb-0 ms-2">{user.username}</p>
          </div>
          <div className="d-flex flex-row align-items-center">
            <p className="small text-muted mb-0">{date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home(context) {
  const { posts } = context
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
    savePost(post);
    setPost('');
  };

  return (
    <>
      <h1 className="text-center">
        Notifier
      </h1>
      <div className="row d-flex justify-content-center mt-4">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-0 border bg-light">
            <div className="card-body p-4">
              <div className="form-outline mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type comment..."
                  value={post}
                  onChange={changePostHandler}
                />
                <button
                  type="button"
                  className="btn btn-outline-dark mt-2"
                  onClick={submitPostHandler}
                >
                  + Add a message
                </button>
              </div>

              { postsList?.map((post)=>Message(post))}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export async function getServerSideProps() {
  const res = await fetch(`http://web-notifier:8000/api/posts/`);
  const posts = await res.json();
  return { props: { posts } }
}