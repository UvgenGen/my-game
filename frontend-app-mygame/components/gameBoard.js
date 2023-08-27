import { useGameContext } from '../context/GameContext'
import Question from './question'


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

function AnswerPopup() {
  const { getQuestionData, reviewAnswerHandler } = useGameContext();
  const answerData = getQuestionData();
  return (
    <>
      <div
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="text-3xl font-semibold">
                Answer
              </h3>
            </div>
            <div className="relative p-6 flex-auto">
              <p className="my-4 text-slate-500 text-lg leading-relaxed">
                { answerData.answer }
              </p>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => {reviewAnswerHandler(false, answerData.price)}}
              >
                Incorrect
              </button>
              <button
                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => {reviewAnswerHandler(true, answerData.price)}}
              >
                Correct
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  )
}

export default function GameBoard() {
  const { gameState, isCreator } = useGameContext();
  return (
    <>
      { ['SHOW_QUESTION', 'ANSWERING'].includes(gameState) ? <Question/> : <GameTable/> }
      { isCreator && gameState == 'ANSWERING' && <AnswerPopup/>}
    </>
  )
}
