import { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [levelUpEvent, setLevelUpEvent] = useState(null);  // { level, rank }
  const [xpPopups, setXpPopups] = useState([]);            // [{ id, amount, x, y }]
  const [notification, setNotification] = useState(null);  // { type, message }

  const triggerLevelUp = (level, rank) => {
    setLevelUpEvent({ level, rank });
    setTimeout(() => setLevelUpEvent(null), 4000);
  };

  const triggerXPPop = (amount) => {
    const id = Date.now();
    setXpPopups(prev => [...prev, { id, amount }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 2000);
  };

  const handleQuestEvents = (events = []) => {
    for (const event of events) {
      if (event.type === 'levelup') triggerLevelUp(event.level, event.rank);
    }
  };

  return (
    <GameContext.Provider value={{
      levelUpEvent, xpPopups,
      triggerLevelUp, triggerXPPop, handleQuestEvents
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
