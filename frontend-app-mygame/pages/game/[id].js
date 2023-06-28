import Chat from '../../components/chat';


export default function Game(context) {
  const { posts, id } = context;

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">game {id}</h2>
        </div>
        <Chat posts={posts} room={id}/>
      </div>
    </>
  )
}


export async function getServerSideProps({ params }) {
  const res = await fetch(`http://web:8000/chat/api/?room=${params.id}`);
  const posts = await res.json();
  return { props: { posts, id: params.id } }
}
