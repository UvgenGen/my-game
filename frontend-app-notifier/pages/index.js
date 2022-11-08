import { useEffect, useState } from "react";


function Message(context) {
  const {id, message, user, publish_date: date} = context;
  return (
    <div className="card mb-4" key={id}>
      <div className="card-body">
        <p>{message}</p>

        <div className="d-flex justify-content-between">
          <div className="d-flex flex-row align-items-center">
            <img src={user.profile_image_url} alt="avatar" width="25"
              height="25" />
            <p className="small mb-0 ms-2">{user.user}</p>
          </div>
          <div className="d-flex flex-row align-items-center">
            <p className="small text-muted mb-0">{date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [postsList, setPosts] = useState([]);
  const [post, setPost] = useState('');

  useEffect(()=>{
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/api/posts/`);
      const posts = await res.json();
      setPosts(posts);
    }
    fetchData().catch(console.error);
  },[])

  const changePostHandler = (e) => {
    setPost(e.target.value);
  }

  const submitPost = (e) => {
    postsList.unshift({
      user:{
        user: 'Ugen',
        profile_image_url: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(4).webp',
      },
      message: post,
      publish_date: '12.10.2022 13:22',
    });
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
                  onClick={submitPost}
                >
                  + Add a message
                </button>
              </div>

              { postsList.map((post)=>Message(post))}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
