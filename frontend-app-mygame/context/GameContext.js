import { w3cwebsocket as W3CWebSocket } from "websocket";
import React, { createContext, useContext, useEffect, useState } from 'react';

const GameContext = createContext();

export function useGameContext() {
  return useContext(GameContext);
}

export function GameProvider({ children, gameId }) {
  const [activeRound, setActiveRound] = useState(0);
  const [activeThemeId, setActiveThemeId] = useState();
  const [activeQuestionId, setActiveQuestionId] = useState();
  const [roundData, setRoundData] = useState([]);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState();
  const [gameData, setGameData] = useState([]);
  const [userId, setUserId] = useState({});
  const [isCreator, setIsCreator] = useState(false);
  const [questionTime, setQuestionTime] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);

  const client = new W3CWebSocket('ws://localhost:8000/ws/game/' + gameId + '/');

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const gameResponse = await fetch(`http://localhost:8000/game/api/${gameId}`);
        const game = await gameResponse.json();
        setGameStateData(game);

        const userResponse = await fetch(`http://localhost:8000/profiles/api/user_id`);
        const user = await userResponse.json();
        setUserId(user.user_id);
        setIsCreator(user.user_id == game.creator);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    const setGameStateData = (game) => {
      setActiveRound(game.active_round);
      setRoundData(game.data[game.active_round]);
      setActiveThemeId(game.active_question?.theme_id);
      setActiveQuestionId(game.active_question?.question_id);
      setPlayers(game.players);
      setGameState(game.state);
      setGameData(game.data);
    };
    fetchGameData();

    client.onopen = () => {
      console.log(`WebSocket Game Client Connected: ${gameId}`);
      joinPlayerHandler();
    };
    client.onmessage = (message) => {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      switch (messageData.type) {
        case 'question_time_left':
          setQuestionTime(messageData.time_left);
          break;

        case 'answer_time_left':
          setAnswerTime(messageData.time_left);
          break;
        case 'review_answer':
          if (!messageData.is_correct) {
            fetchGameData();
          }
          break;

        default:
          fetchGameData();
          break;
      }
    };
    return () => {
      client.close(); // Close WebSocket connection when unmounting
    };
  }, [])

  const getQuestionData = () => {
    return roundData.themes[activeThemeId].questions[activeQuestionId]
  }

  const getMediaUrl = (type, file) => {
    const fileName = encodeURIComponent(file.slice(1));
    return `/media/${gameId}/${type}/${fileName}`
  }

  const joinPlayerHandler = async () => {
    client.send(
      JSON.stringify({
        type: "join_player",
      })
    );
  }

  const setActivePlayerHandler = (user_id) => {
    client.send(
      JSON.stringify({
        type: "set_active_player",
        user_id: user_id,
      })
    );
  }

  const showQuestionHandler = (themeIndex, questionIndex, question) => {
    client.send(
      JSON.stringify({
        type: "show_question",
        round_id: activeRound,
        theme_id: themeIndex,
        question_id: questionIndex,
      })
    );
  };

  const answerHandler = () => {
    client.send(
      JSON.stringify({
        type: "answering",
        user_id: userId,
      })
    );
  }

  const reviewAnswerHandler = (correctness, price) => {
    client.send(
      JSON.stringify({
        type: "review_answer",
        is_correct: correctness,
        price: price
      })
    );
    if (correctness){
      client.send(
        JSON.stringify({
          type: "show_answer"
        })
      );
    }
  }

  const setRoundHandler = (event) => {
    client.send(
      JSON.stringify({
        type: "update_round",
        round_id: event.target.value,
      })
    );
  }

  const updateScore = (playerId, newScore) => {
    client.send(
      JSON.stringify({
        type: "update_score",
        player_id: playerId,
        score: newScore,
      })
    );
  }

  const contextValue = {
    questionTime,
    answerTime,
    userId,
    isCreator,
    gameId,
    gameState,
    gameData,
    roundData,
    activeRound,
    players,
    setActiveRound,
    setRoundData,
    setPlayers,
    updateScore,
    getQuestionData,
    setActivePlayerHandler,
    setRoundHandler,
    answerHandler,
    reviewAnswerHandler,
    showQuestionHandler,
    getMediaUrl,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}
