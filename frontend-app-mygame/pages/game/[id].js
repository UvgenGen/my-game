import Chat from '../../components/chat';


export default function Game(context) {
  const { posts, id } = context;
  const themes = [
    {
      name: 'theme 1',
      questions: [100, 200, 300, 400, 500, 600, 700, 800],
    },
    {
      name: 'theme 2',
      questions: [100, 200, 300, 400, 500, 600, 700, 800],
    },
    {
      name: 'theme 3',
      questions: [100, 200, 300, 400, 500, 600, 700, 800],
    },
  ];

  return (
    <div className="m-1 sm:m-5 md:m-7 h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
          game {id}
        </h2>
      </div>
      <div className="grid grid-cols-12 gap-2 mb-15">
        <div className="col-span-12 sm:col-span-9 min-w-full h-full">
          <div className="rounded-lg border border-gray-500 p-2 sm:p-8 h-4/6">
            <table className="min-w-full">
              <tbody>
                  {themes.map((theme, themeIndex) => (
                    <tr className="bg-gray-100 border-b" key={themeIndex}>
                      <td className="text-xs tracking-tighter text-gray-900 font-light p-2 whitespace-nowrap">
                        {theme.name}
                      </td>
                      {theme.questions.map((value, index) => (
                        <td
                          key={index}
                          className="text-xs tracking-tighter text-gray-900 font-light p-2 whitespace-nowrap"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center col-span-12 rounded-lg border border-gray-400 p-2 h-3/6 sm:h-2/6">
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
            <div className="card w-1/6 h-full mx-auto bg-white shadow-xl">
              <img className="w-2/6 mx-auto rounded-full border-white" src="https://avatars.githubusercontent.com/u/67946056?v=4" alt=""/>
              <div className="text-center">Ajo Alex</div>
              <div className="text-center">10000</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-lg border border-gray-400 sm:pb-52 p-2 sm:col-span-3 h-full">
          <Chat posts={posts} room={id} />
        </div>
      </div>
    </div>

  )
}


export async function getServerSideProps({ params }) {
  const res = await fetch(`http://web:8000/chat/api/?room=${params.id}`);
  const posts = await res.json();
  return { props: { posts, id: params.id } }
}
