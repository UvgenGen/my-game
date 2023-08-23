import { w3cwebsocket as W3CWebSocket } from "websocket";
import React, { createContext, useContext, useEffect, useState } from 'react';

const GameContext = createContext();

export function useGameContext() {
  return useContext(GameContext);
}

export function GameProvider({ children, gameId }) {
  const [activeRound, setActiveRound] = useState(0);
  const [roundData, setRoundData] = useState([]);
  const [questionData, setQuestionData] = useState({});
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState();
  const [gameData, setGameData] = useState([]);

  const client = new W3CWebSocket('ws://localhost:8000/ws/game/' + gameId + '/');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const game_response = await fetch(`http://localhost:8000/game/api/${gameId}`);
        const game = await game_response.json();
        setActiveRound(game.active_round);
        setRoundData(game.data[game.active_round]);
        setPlayers(game.players);
        setGameState(game.state);
        setGameData(game.data);
        console.log(game);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    fetchData();

    client.onopen = () => {
      console.log(`WebSocket Game Client Connected: ${gameId}`);
    };
    client.onmessage = (message) => {
      const messageData = JSON.parse(message.data);
      if (messageData.type = 'show_question') {
        setGameState(messageData.state);
        setQuestionData(messageData.question);
        console.log(messageData)
      }
    };
    return () => {
      client.close(); // Close WebSocket connection when unmounting
    };
  }, [])

  const setRoundHandler = (event) => {
    setActiveRound(event.target.value);
    setRoundData(gameData[event.target.value]);
  }

  const showQuestionHandler = (themeIndex, questionIndex, question) => {
    console.log('setActivePlayerHandler')
    console.log(themeIndex, questionIndex, question);
    client.send(
      JSON.stringify({
        type: "show_question",
        round_id: activeRound,
        question_id: questionIndex,
        theme_id: themeIndex,
        question: question,
      })
    );
  };

  const getMediaUrl = (type, file) => {
    const fileName = encodeURIComponent(file.slice(1));
    return `/media/${gameId}/${type}/${fileName}`
  }

  const contextValue = {
    gameId,
    gameState,
    gameData,
    roundData,
    activeRound,
    questionData,
    players,
    setActiveRound,
    setRoundData,
    setPlayers,
    setRoundHandler,
    showQuestionHandler,
    getMediaUrl,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}
