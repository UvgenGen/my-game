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
  const [userId, setUserId] = useState({});
  const [creatorId, setCreatorId] = useState({});
  const [isCreator, setIsCreator] = useState({});

  const client = new W3CWebSocket('ws://localhost:8000/ws/game/' + gameId + '/');

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/game/api/${gameId}`);
        const game = await response.json();
        setActiveRound(game.active_round);
        setRoundData(game.data[game.active_round]);
        setPlayers(game.players);
        setGameState(game.state);
        setGameData(game.data);
        setCreatorId(game.creator);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/profiles/api/user_id`);
        const player = await response.json();
        setUserId(player.user_id);
        if (player.user_id == creatorId) {
          setIsCreator(true);
        }
        client.send(
          JSON.stringify({
            type: "join_player",
          })
        );
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    const initializeData = async () => {
      await Promise.all([fetchGameData(), fetchPlayerData()]);
    };
    initializeData();

    client.onopen = () => {
      console.log(`WebSocket Game Client Connected: ${gameId}`);
    };
    client.onmessage = (message) => {
      const messageData = JSON.parse(message.data);
      switch (messageData.type) {
        case 'show_question':
          setGameState(messageData.state);
          setQuestionData(messageData.question);
          break;

        case 'pause':
          break;

        case 'answering':
          break;

        case 'answering':
          break;

        case 'show_answer':
          break;

        case 'update_round':
          const updatedRoundId = parseInt(messageData.round_id);
          setActiveRound(updatedRoundId);
          fetchGameData();
          break;

        case 'join_player':
          fetchGameData();
          break;

        default:
          break;
      }
    };
    return () => {
      client.close(); // Close WebSocket connection when unmounting
    };
  }, [])

  const setRoundHandler = (event) => {
    client.send(
      JSON.stringify({
        type: "update_round",
        round_id: event.target.value,
      })
    );
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
    isCreator,
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
