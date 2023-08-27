import { useGameContext } from '../context/GameContext'


function GameTable() {
  const { roundData, showQuestionHandler } = useGameContext();
  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <tbody className="text-xs uppercase">
        {roundData?.themes?.map((theme, themeIndex) => (
          <tr className="bg-white border dark:bg-gray-800 dark:border-gray-700" key={themeIndex}>
            <td className="border dark:bg-gray-800 dark:border-gray-700 px-6 py-3">
              {theme.name}
            </td>
            {theme.questions.map((question, questionIndex) => (
              <td
                key={questionIndex}
                className="border dark:bg-gray-800 text-center dark:border-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => showQuestionHandler(themeIndex, questionIndex, question)}
              >
                {question.price}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Question() {
  const { questionData, getMediaUrl } = useGameContext();
  const renderContent = (question, index) => {
    switch (question.type) {
      case 'image':
        return (
          <div className="flex justify-center items-center h-full" key={index}>
            <img className="h-fit" src={getMediaUrl('images', question.value)} alt=""/>
          </div>
        )
      case 'video':
        return (
          <video className="flex justify-center items-center h-full" autoplay="autoplay" key={index}>
            <source src={getMediaUrl('videos', question.value)} type="video/mp4"/>
          </video>
        )
      case 'voice':
        return (
          <>
            <div className="flex justify-center items-center h-full" key={index}>
              <img className="h-fit" src='/static/images/audio.png' alt=""/>
            </div>
            <audio id="myaudio" autoplay="autoplay">
              <source src={getMediaUrl('audios', question.value)} type="audio/mpeg"/>
            </audio>
          </>
        )
      case 'text':
        return (
          <div className="p-5">
            <p className="font-normal text-gray-700 mb-3 dark:text-gray-400">{question.value}</p>
          </div>
        )
    }
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 h-full rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {questionData?.question_content?.map((question, index) => renderContent(question, index))}
    </div>
  )
}

export default function GameBoard() {
  const { gameState } = useGameContext();
  return (
    <>
      { gameState == 'showing_question' ? <Question/> : <GameTable/> }
    </>
  )
}
