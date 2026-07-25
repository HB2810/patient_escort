import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { soundAlert } from '../services/soundAlert';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
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
      toast.success(`NEW DISPATCH: ${trip.patient_name} (${trip.origin_dept} ➔ ${trip.dest_dept})`, { duration: 6000, icon: '🔔' });
    });

    newSocket.on('trip:updated', (trip) => {
      if (trip.status === 'HANDOVER_PENDING') {
        soundAlert.playSound('handover');
        toast(`HANDOVER PENDING: ${trip.patient_name} arrived at ${trip.dest_dept}!`, { duration: 6000, icon: '🤝' });
      } else {
        soundAlert.playSound('new_request');
        toast(`STATUS UPDATE: Trip #${trip.id} is now ${trip.status.replace('_', ' ')}`, { duration: 4000 });
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, soundEnabled, toggleSound }}>
      {children}
    </SocketContext.Provider>
  );
};
