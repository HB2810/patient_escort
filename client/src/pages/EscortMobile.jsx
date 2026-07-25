import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const EscortMobile = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [myTrip, setMyTrip] = useState(null);

  const fetchMyTask = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/trips');
      // Find active trip for OPD escort or Dept escort
      const assigned = res.data.data.find(t => 
        (t.opd_escort_id === user?.id || t.dept_escort_id === user?.id || t.opd_escort_id === 5 || t.dept_escort_id === 7) && 
        t.status !== 'PROCEDURE_COMPLETE'
      );
      setMyTrip(assigned || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMyTask();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('trip:created', fetchMyTask);
    socket.on('trip:updated', fetchMyTask);
    return () => {
      socket.off('trip:created', fetchMyTask);
      socket.off('trip:updated', fetchMyTask);
    };
  }, [socket]);

  const updateTripStatus = async (newStatus) => {
    if (!myTrip) return;
    try {
      await axios.patch(`http://localhost:5001/api/trips/${myTrip.id}/status`, { status: newStatus });
      fetchMyTask();
    } catch (e) {
      alert('Failed to update trip status');
    }
  };

  return (
    <div style={{ background: '#F4F7FB', minHeight: 'calc(100vh - 60px)', color: '#212529', padding: '1.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        


        {/* Escort Team Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h4 className="fw-bold mb-0" style={{ color: '#1B6CA8' }}>📱 Escort Companion</h4>
            <span className="badge bg-light text-dark border mt-1">Team: {user?.department || 'OPD'} Escort Team</span>
          </div>
          <button onClick={logout} className="btn btn-outline-danger btn-sm">Logout</button>
        </div>



        {/* Active Task Card */}
        {myTrip ? (
          <div className="card bg-white border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px', borderLeft: '5px solid #1B6CA8' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary px-3 py-2">TRIP #{myTrip.id}</span>
              <span className="badge bg-warning text-dark px-3 py-2">{myTrip.status.replace('_', ' ')}</span>
            </div>

            <h3 className="fw-bold text-dark mb-1">
              {myTrip.is_privileged && <span className="text-warning me-2">👑</span>}
              {myTrip.patient_name}
            </h3>
            <p className="text-secondary mb-3">{myTrip.patient_uhid} • Mode: <strong className="text-dark">{myTrip.mode}</strong></p>

            {/* Transfer Route */}
            <div className="bg-light p-3 rounded mb-4 border">
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-danger me-2">FROM</span>
                <span className="fw-bold text-dark">Cabin {myTrip.origin_cabin_id} ({myTrip.origin_dept})</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-success me-2">TO</span>
                <span className="fw-bold text-dark">{myTrip.dest_dept} - {myTrip.dest_room}</span>
              </div>
              <div className="d-flex align-items-center border-top pt-2 mt-2">
                <small className="text-muted">Assigned OPD Escort: <strong>{myTrip.opd_escort_name}</strong></small>
              </div>
            </div>

            {/* Inter-Departmental Handover Workflow Buttons */}
            <div className="d-grid gap-3">
              {myTrip.status === 'ASSIGNED' && (
                <button onClick={() => updateTripStatus('ACKNOWLEDGED')} className="btn btn-warning py-3 fw-bold fs-5 shadow-sm">
                  👍 Acknowledge / On My Way to OPD Cabin
                </button>
              )}

              {myTrip.status === 'ACKNOWLEDGED' && (
                <button onClick={() => updateTripStatus('PICKED_UP')} className="btn btn-info py-3 fw-bold fs-5 text-white shadow-sm">
                  🛈 Patient Picked Up from OPD Cabin
                </button>
              )}

              {myTrip.status === 'PICKED_UP' && (
                <button onClick={() => updateTripStatus('HANDOVER_PENDING')} className="btn btn-primary py-3 fw-bold fs-5 shadow-sm" style={{ backgroundColor: '#1B6CA8' }}>
                  🤝 Arrived at {myTrip.dest_dept} - Initiate Handover
                </button>
              )}

              {myTrip.status === 'HANDOVER_PENDING' && (
                <div className="alert alert-warning text-center fw-bold border-0 shadow-sm py-3 mb-0">
                  ⏳ Waiting for {myTrip.dest_dept} Escort / Desk to Accept Handover...
                </div>
              )}

              {myTrip.status === 'HANDOVER_ACCEPTED' && (
                <div className="alert alert-success text-center fw-bold border-0 shadow-sm py-3 mb-0">
                  ✅ Patient Successfully Handed Over to {myTrip.dest_dept} Team! You are now Available.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card bg-white border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>⏳</div>
            <h5 className="mt-3 text-dark fw-bold">No Active Assignment</h5>
            <p className="small mb-0">Stay nearby. You will receive an instant alert when a consultant dispatches an escort.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default EscortMobile;
