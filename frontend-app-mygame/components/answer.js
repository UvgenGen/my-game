import { useGameContext } from '../context/GameContext'
import ProgressBar from './progressBar';

export default function Answer() {
  const { getQuestionData, getMediaUrl, answerTime, } = useGameContext();
  const questionData = getQuestionData();
  const renderContent = (answer, index) => {
    switch (answer.type) {
      case 'image':
        return (
          <div className="flex justify-center items-center" key={index}>
            <img className="h-fit" src={getMediaUrl('images', answer.value)} alt=""/>
          </div>
        )
      case 'video':
        return (
          <video className="flex justify-center items-center" autoPlay="autoplay" key={index}>
            <source src={getMediaUrl('videos', answer.value)} type="video/mp4"/>
          </video>
        )
      case 'voice':
        return (
          <>
            <div className="flex justify-center items-center" key={index}>
              <img className="h-fit" src='/static/images/audio.png' alt=""/>
            </div>
            <audio id="myaudio" autoPlay="autoplay">
              <source src={getMediaUrl('audios', answer.value)} type="audio/mpeg"/>
            </audio>
          </>
        )
      case 'html':
        return (
          <div className="flex justify-center items-center p-2" key={index}>
            <iframe
              src={getMediaUrl('html', answer.value)}
              className="w-full h-[65vh] rounded-lg border border-brd bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="interactive content"
            />
          </div>
        )
      case 'text':
        return (
          <div className="p-6" key={index}>
            <p className="font-display text-2xl leading-relaxed text-ink text-center">{answer.value}</p>
          </div>
        )
    }
  };

  return (
    <>
      <div className="card h-full p-4">
        <ProgressBar max={5} current={answerTime}/>
        {questionData?.answer_content?.map((answer, index) => renderContent(answer, index))}
        <div className="p-6">
          <p className="font-display text-3xl text-correct text-center [text-shadow:0_0_14px_rgba(6,214,160,.5)]">{questionData?.answer}</p>
        </div>
      </div>
    </>
  )
}