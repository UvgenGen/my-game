import { useGameContext } from '../context/GameContext'
import useActionGuard from '../hooks/useActionGuard'
import ProgressBar from './progressBar';

export default function Question() {
  const { getQuestionData, getMediaUrl, questionTime, isCreator, showAnswerHandler } = useGameContext();
  const questionData = getQuestionData();
  // Interactive HTML questions are host-paced: no auto countdown, the creator
  // reveals the answer when the player has finished the mini-game.
  const isHtml = questionData?.question_content?.some((item) => item.type === 'html');
  const [reveal, revealing] = useActionGuard(showAnswerHandler);
  const renderContent = (question, index) => {
    switch (question.type) {
      case 'image':
        return (
          <div className="flex justify-center items-center" key={index}>
            <img className="h-fit" src={getMediaUrl('images', question.value)} alt=""/>
          </div>
        )
      case 'video':
        return (
          <video className="flex justify-center items-center" autoPlay="autoplay" key={index}>
            <source src={getMediaUrl('videos', question.value)} type="video/mp4"/>
          </video>
        )
      case 'voice':
        return (
          <>
            <div className="flex justify-center items-center" key={index}>
              <img className="h-fit" src='/static/images/audio.png' alt=""/>
            </div>
            <audio id="myaudio" autoPlay="autoplay">
              <source src={getMediaUrl('audios', question.value)} type="audio/mpeg"/>
            </audio>
          </>
        )
      case 'html':
        return (
          <div className="flex justify-center items-center p-2" key={index}>
            <iframe
              src={getMediaUrl('html', question.value)}
              className="w-full h-[65vh] rounded-lg border border-brd bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="interactive content"
            />
          </div>
        )
      case 'text':
        return (
          <div className="p-6" key={index}>
            <p className="font-display text-2xl leading-relaxed text-ink text-center">{question.value}</p>
          </div>
        )
    }
  };

  return (
    <div className="card h-full p-4">
      {isHtml
        ? <div className="mb-3 text-center text-xs uppercase tracking-wide text-muted">Interactive — the host reveals the answer when ready</div>
        : <ProgressBar max={45} current={questionTime}/>}
      {questionData?.question_content?.map((question, index) => renderContent(question, index))}
      {isHtml && isCreator && (
        <div className="flex justify-center mt-4">
          <button type="button" className="btn-primary px-6 py-2 disabled:opacity-60 disabled:cursor-not-allowed" onClick={reveal} disabled={revealing}>
            Reveal answer
          </button>
        </div>
      )}
    </div>
  )
}