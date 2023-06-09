import Chat from '../../components/chat';
import { useRouter } from 'next/router';


export default function Game(context) {
  const { posts } = context;
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">game {id}</h2>
        </div>
        <Chat posts={posts}/>
      </div>
    </>
  )
}


export async function getServerSideProps() {
  const res = await fetch(`http://web:8000/posts/api/`);
  const posts = await res.json();
  return { props: { posts } }
}
