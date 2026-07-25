import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { soundAlert } from '../services/soundAlert';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundAlert.soundEnabled = nextState;
    if (nextState) soundAlert.playSound('new_request');
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Realtime Socket Connected');
    });

    newSocket.on('trip:created', (trip) => {
      soundAlert.playSound('new_request');
      setLastNotification(`🔔 NEW DISPATCH: ${trip.patient_name} (${trip.origin_dept} ➔ ${trip.dest_dept})`);
    });

    newSocket.on('trip:updated', (trip) => {
      if (trip.status === 'HANDOVER_PENDING') {
        soundAlert.playSound('handover');
        setLastNotification(`🤝 HANDOVER PENDING: ${trip.patient_name} arrived at ${trip.dest_dept}!`);
      } else {
        soundAlert.playSound('new_request');
        setLastNotification(`STATUS UPDATE: Trip #${trip.id} is now ${trip.status.replace('_', ' ')}`);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, lastNotification, soundEnabled, toggleSound }}>
      {children}
    </SocketContext.Provider>
  );
};
