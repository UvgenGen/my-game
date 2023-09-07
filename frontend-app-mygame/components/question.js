import { useGameContext } from '../context/GameContext'
import ProgressBar from './progressBar';

export default function Question() {
  const { getQuestionData, getMediaUrl, questionTime, } = useGameContext();
  const questionData = getQuestionData();
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
      case 'text':
        return (
          <div className="p-5" key={index}>
            <p className="font-normal text-gray-700 mb-3 dark:text-gray-400">{question.value}</p>
          </div>
        )
    }
  };

  return (
    <>
      <div className="bg-white shadow-md border border-gray-200 h-full rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <ProgressBar max={45} current={questionTime}/>
        {questionData?.question_content?.map((question, index) => renderContent(question, index))}
      </div>
    </>
  )
}