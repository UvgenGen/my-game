import { useGameContext } from '../context/GameContext'
import Question from './question'
import Answer from './answer'


function GameTable() {
  const { roundData, showQuestionHandler } = useGameContext();
  return (
    <div className="space-y-2">
      {roundData?.themes?.map((theme, themeIndex) => (
        <div className="grid grid-cols-5 gap-2 items-stretch" key={themeIndex}>
          <div className="col-span-1 flex items-center px-3 py-3 rounded-md bg-surface-2 border border-brd
                          font-display text-xs font-bold uppercase tracking-wide text-ink">
            {theme.name}
          </div>
          {theme.questions.map((question, questionIndex) => (
            question?.completed
              ? <div key={questionIndex} className="tile tile--done text-lg py-4">{question.price}</div>
              : <div key={questionIndex} className="tile text-xl py-4"
                  onClick={() => showQuestionHandler(themeIndex, questionIndex, question)}>
                  {question.price}
                </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AnswerPopup() {
  const { getQuestionData, reviewAnswerHandler } = useGameContext();
  const answerData = getQuestionData();
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="card p-0 w-full shadow-glow-cyan">
            <div className="flex items-start justify-between p-5 border-b border-brd">
              <h3 className="font-display text-2xl font-bold text-ink">Answer</h3>
            </div>
            <div className="p-6">
              <p className="text-lg leading-relaxed text-ink">{answerData?.answer}</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-brd">
              <button type="button"
                className="btn bg-incorrect/15 text-incorrect border border-incorrect/60 uppercase tracking-wide hover:bg-incorrect hover:text-night hover:shadow-glow-red"
                onClick={() => reviewAnswerHandler(false, answerData?.price)}>
                Incorrect
              </button>
              <button type="button"
                className="btn bg-correct/15 text-correct border border-correct/60 uppercase tracking-wide hover:bg-correct hover:text-night hover:shadow-glow-green"
                onClick={() => reviewAnswerHandler(true, answerData?.price)}>
                Correct
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}

export default function GameBoard() {
  const { gameState, isCreator } = useGameContext();
  const renderContent = () => {
    switch (gameState) {
      case 'SHOW_QUESTION':
      case 'ANSWERING':
        return <Question/>

      case 'SHOW_ANSWER':
        return <Answer/>
    
      default:
        return <GameTable/>
    }
  }
  return (
    <>
      { renderContent() }
      { isCreator && gameState == 'ANSWERING' && <AnswerPopup/>}
    </>
  )
}
