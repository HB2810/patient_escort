import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const DepartmentBoard = () => {
  const { user, logout } = useAuth();
  const { socket, lastNotification } = useSocket();

  const [trips, setTrips] = useState([]);

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/trips');
      setTrips(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('trip:created', fetchTrips);
    socket.on('trip:updated', fetchTrips);
    return () => {
      socket.off('trip:created', fetchTrips);
      socket.off('trip:updated', fetchTrips);
    };
  }, [socket]);

  const updateStatus = async (tripId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/trips/${tripId}/status`, { status: newStatus });
      fetchTrips();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const incomingTrips = trips.filter(t => t.dest_dept === (user?.department || 'Radiology') || t.dest_dept === 'Radiology');

  return (
    <div style={{ background: '#F4F7FB', minHeight: 'calc(100vh - 60px)', padding: '2rem 0' }}>
      <div className="container">
        
        {lastNotification && (
          <div className="alert alert-info shadow-sm mb-4">
            ⚡ <strong>Notification:</strong> {lastNotification}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: '#1B6CA8' }}>
              {user?.department || 'Radiology'} Escort & Front Desk
            </h2>
            <p className="text-secondary mb-0">Receive patient handovers from OPD Escorts and manage departmental care.</p>
          </div>
          <button onClick={logout} className="btn btn-outline-danger px-4">Logout</button>
        </div>

        {/* Handover & In-Care Patient Queue */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
          <h5 className="fw-bold mb-4">Incoming OPD Handovers & Active Department Queue</h5>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Trip ID</th>
                  <th>Patient Name</th>
                  <th>Origin OPD</th>
                  <th>Target Room</th>
                  <th>OPD Escort (Handover)</th>
                  <th>Status</th>
                  <th>Handover Action</th>
                </tr>
              </thead>
              <tbody>
                {incomingTrips.map(trip => (
                  <tr key={trip.id}>
                    <td className="fw-bold">
                      #{trip.id}
                      {trip.is_privileged && <span className="badge bg-warning text-dark ms-2">👑 Privileged</span>}
                    </td>
                    <td>
                      <div className="fw-bold">{trip.patient_name}</div>
                      <small className="text-muted">{trip.patient_uhid}</small>
                    </td>
                    <td>Cabin {trip.origin_cabin_id} ({trip.origin_dept})</td>
                    <td>{trip.dest_room}</td>
                    <td>👤 {trip.opd_escort_name}</td>
                    <td>
                      <span className={`badge ${trip.status === 'HANDOVER_ACCEPTED' ? 'bg-success' : trip.status === 'HANDOVER_PENDING' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {trip.status === 'HANDOVER_PENDING' && (
                        <button 
                          onClick={() => updateStatus(trip.id, 'HANDOVER_ACCEPTED')}
                          className="btn btn-sm btn-success fw-bold px-3 shadow-sm"
                        >
                          🤝 Accept Handover from OPD Escort
                        </button>
                      )}

                      {trip.status === 'HANDOVER_ACCEPTED' && (
                        <button 
                          onClick={() => updateStatus(trip.id, 'PROCEDURE_COMPLETE')}
                          className="btn btn-sm btn-primary fw-bold px-3 shadow-sm"
                          style={{ backgroundColor: '#1B6CA8' }}
                        >
                          🔄 Procedure Complete (Initiate Return)
                        </button>
                      )}

                      {trip.status === 'PROCEDURE_COMPLETE' && (
                        <span className="badge bg-light text-secondary border">Return Trip Dispatched to OPD</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DepartmentBoard;
