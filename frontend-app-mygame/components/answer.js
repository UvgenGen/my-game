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
      case 'text':
        return (
          <div className="p-5" key={index}>
            <p className="font-normal text-gray-700 mb-3 dark:text-gray-400">{answer.value}</p>
          </div>
        )
    }
  };

  return (
    <>
      <div className="bg-white shadow-md border border-gray-200 h-full rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <ProgressBar max={5} current={answerTime}/>
        {questionData?.answer_content?.map((answer, index) => renderContent(answer, index))}
        <div className="p-5">
          <p className="font-normal text-gray-700 mb-3 dark:text-gray-400 text-center">{questionData?.answer}</p>
        </div>
      </div>
    </>
  )
}