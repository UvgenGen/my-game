import { w3cwebsocket as W3CWebSocket } from "websocket";
import React, { createContext, useContext, useEffect, useState } from 'react';

const GameContext = createContext();

export function useGameContext() {
  return useContext(GameContext);
}

export function GameProvider({ children, gameId }) {
  const [activeRound, setActiveRound] = useState(0);
  const [roundData, setRoundData] = useState([]);
  const [roundName, setRoundName] = useState('');
  const [players, setPlayers] = useState([]);

  const client = new W3CWebSocket('ws://localhost:8000/ws/game/' + gameId + '/');

  useEffect(() => {
    client.onopen = () => {
      console.log(`WebSocket Game Client Connected: ${gameId}`);
    };
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer) {
        console.log(dataFromServer);
      }
    };

    return () => {
      client.close(); // Close WebSocket connection when unmounting
    };
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const game_response = await fetch(`http://localhost:8000/game/api/${gameId}`);
        const game = await game_response.json();

        setActiveRound(game.active_round);
        setRoundData(game.data[game.active_round]);
        setRoundName(game.data[game.active_round].name);
        setPlayers(game.players);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };

    fetchData();
  }, [activeRound])

  const showQuestionHandler = (e) => {
    console.log('setActivePlayerHandler')
    client.send(
      JSON.stringify({
        type: "show_question",
        round_id: activeRound,
        question_id: 1,
        theme_id: 1,
      })
    );
  };


  const contextValue = {
    gameId,
    activeRound,
    setActiveRound,
    roundData,
    setRoundData,
    roundName,
    setRoundName,
    players,
    setPlayers,
    showQuestionHandler
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}
