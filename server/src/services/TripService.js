const { memoryStore } = require('../db');

class TripService {
  static getAllTrips() {
    return memoryStore.trips;
  }

  static getTripById(id) {
    return memoryStore.trips.find(t => t.id === parseInt(id));
  }

  // Doctor/Consultant creates transfer request from OPD Cabin
  static createTrip(data) {
    const newId = 1000 + memoryStore.trips.length + 1;
    const originCabinId = parseInt(data.origin_cabin_id) || 1;
    const isPrivileged = originCabinId >= 14;

    // Auto-assign available OPD Escort
    const assignedOpdEscort = memoryStore.escorts.find(e => e.department === 'OPD' && e.status === 'AVAILABLE');
    
    // Auto-assign available Department Escort
    const assignedDeptEscort = memoryStore.escorts.find(e => e.department === data.dest_dept && e.status === 'AVAILABLE');

    const trip = {
      id: newId,
      patient_name: data.patient_name || 'Anonymous Patient',
      patient_uhid: data.patient_uhid || `STV-2026-${Math.floor(100 + Math.random() * 900)}`,
      origin_dept: data.origin_dept || 'OPD',
      origin_cabin_id: originCabinId,
      is_privileged: isPrivileged,
      dest_dept: data.dest_dept || 'Radiology',
      dest_room: data.dest_room || 'Scan Room',
      opd_escort_id: assignedOpdEscort ? assignedOpdEscort.id : 5,
      opd_escort_name: assignedOpdEscort ? `${assignedOpdEscort.name} (OPD)` : 'Ramesh Kumar (OPD)',
      dept_escort_id: assignedDeptEscort ? assignedDeptEscort.id : 7,
      dept_escort_name: assignedDeptEscort ? `${assignedDeptEscort.name} (${data.dest_dept})` : `Vikram Singh (${data.dest_dept})`,
      mode: data.mode || 'WHEELCHAIR',
      priority: isPrivileged ? 'HIGH_PRIVILEGED' : (data.priority || 'NORMAL'),
      status: 'ASSIGNED',
      requested_at: new Date(),
      assigned_at: new Date(),
      picked_up_at: null,
      arrived_at_dept_at: null,
      handover_accepted_at: null,
      delivered_at: null,
      notes: data.notes || (isPrivileged ? 'Privileged Consultant Dispatch' : 'Standard Consultant Dispatch')
    };

    if (assignedOpdEscort) assignedOpdEscort.status = 'BUSY';

    const cabin = memoryStore.cabins.find(c => c.id === originCabinId);
    if (cabin) cabin.status = 'BUSY';

    memoryStore.trips.unshift(trip);
    return trip;
  }

  // Update Handover State Machine
  static updateStatus(id, newStatus) {
    const trip = this.getTripById(id);
    if (!trip) throw new Error('Trip not found');

    trip.status = newStatus;
    const now = new Date();

    if (newStatus === 'ACKNOWLEDGED') {
      trip.acknowledged_at = now;
    }

    if (newStatus === 'PICKED_UP' || newStatus === 'IN_TRANSIT') {
      trip.picked_up_at = now;
    }

    if (newStatus === 'ARRIVED_AT_DEPT' || newStatus === 'HANDOVER_PENDING') {
      trip.arrived_at_dept_at = now;
      trip.status = 'HANDOVER_PENDING';
    }

    if (newStatus === 'HANDOVER_ACCEPTED') {
      trip.handover_accepted_at = now;
      trip.status = 'HANDOVER_ACCEPTED';

      // OPD Escort is now FREE after handing over patient to Dept Team!
      if (trip.opd_escort_id) {
        const opdEscort = memoryStore.escorts.find(e => e.id === trip.opd_escort_id);
        if (opdEscort) opdEscort.status = 'AVAILABLE';
      }

      // Dept Escort is now BUSY taking care of patient in Radiology/Physio
      if (trip.dept_escort_id) {
        const deptEscort = memoryStore.escorts.find(e => e.id === trip.dept_escort_id);
        if (deptEscort) deptEscort.status = 'BUSY';
      }
    }

    if (newStatus === 'PROCEDURE_COMPLETE') {
      trip.delivered_at = now;
      trip.status = 'PROCEDURE_COMPLETE';

      // Dept Escort is now FREE
      if (trip.dept_escort_id) {
        const deptEscort = memoryStore.escorts.find(e => e.id === trip.dept_escort_id);
        if (deptEscort) deptEscort.status = 'AVAILABLE';
      }

      // Auto-dispatch Return Trip back to OPD Cabin
      this.createTrip({
        patient_name: trip.patient_name,
        patient_uhid: trip.patient_uhid,
        origin_dept: trip.dest_dept,
        origin_cabin_id: trip.origin_cabin_id,
        dest_dept: 'OPD',
        dest_room: `Cabin ${trip.origin_cabin_id}`,
        mode: trip.mode,
        priority: trip.priority,
        notes: `Return trip from ${trip.dest_dept}`
      });
    }

    return trip;
  }
}

module.exports = TripService;
