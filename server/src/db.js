const mysql = require('mysql2/promise');
require('dotenv').config();

// In-Memory Database Fallback with 13 Normal + 2 Privileged OPDs and Department Escort Teams
class MemoryStore {
  constructor() {
    // 15 OPD Members (Different Credentials)
    const opdUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      username: `opd_${i + 1}`,
      name: `OPD Consultant ${i + 1}`,
      role: 'OPD Front Desk',
      department: 'OPD'
    }));

    // 4 OPD Escort Members
    const opdEscortUsers = Array.from({ length: 4 }, (_, i) => ({
      id: i + 16,
      username: `opd_escort_${i + 1}`,
      name: `OPD Escort ${i + 1}`,
      role: 'Escort',
      department: 'OPD'
    }));

    // 2 Physiotherapy Members (1 Desk, 1 Escort)
    const physioUsers = [
      { id: 20, username: 'physio_desk', name: 'Physiotherapy Desk', role: 'Department Front Desk', department: 'Physiotherapy' },
      { id: 21, username: 'physio_escort', name: 'Physio Escort 1', role: 'Escort', department: 'Physiotherapy' }
    ];

    // 2 Radiology Members (1 Desk, 1 Escort)
    const radUsers = [
      { id: 22, username: 'rad_desk', name: 'Radiology Desk', role: 'Department Front Desk', department: 'Radiology' },
      { id: 23, username: 'rad_escort', name: 'Radiology Escort 1', role: 'Escort', department: 'Radiology' }
    ];

    this.users = [...opdUsers, ...opdEscortUsers, ...physioUsers, ...radUsers];

    // 13 Normal OPD Cabins (1-13) + 2 Privileged OPD Cabins (14-15)
    this.cabins = Array.from({ length: 15 }, (_, i) => {
      const cabinNum = i + 1;
      const isPrivileged = cabinNum >= 14;
      return {
        id: cabinNum,
        cabin_number: isPrivileged ? `Privileged Cabin ${cabinNum}` : `OPD Cabin ${cabinNum}`,
        department: 'OPD',
        type: isPrivileged ? 'PRIVILEGED_OPD' : 'NORMAL_OPD',
        is_privileged: isPrivileged,
        assigned_escort_id: isPrivileged ? 16 : (cabinNum % 2 === 0 ? 17 : 18), // mapped to new escort ids
        status: 'IDLE'
      };
    });

    // Escorts categorized by Department Teams
    this.escorts = [
      ...opdEscortUsers.map(u => ({ id: u.id, user_id: u.id, name: u.name, department: u.department, status: 'AVAILABLE', current_location: 'OPD Waiting Lounge' })),
      { id: 21, user_id: 21, name: 'Physio Escort 1', department: 'Physiotherapy', status: 'AVAILABLE', current_location: 'Physio Rehab Area' },
      { id: 23, user_id: 23, name: 'Radiology Escort 1', department: 'Radiology', status: 'AVAILABLE', current_location: 'Radiology Desk' }
    ];

    // Initial trips with Handover state support - Updating IDs to match new escorts
    this.trips = [
      {
        id: 1001,
        patient_name: 'Rajesh Sharma',
        patient_uhid: 'STV-2026-891',
        origin_dept: 'OPD',
        origin_cabin_id: 14,
        is_privileged: true,
        dest_dept: 'Radiology',
        dest_room: 'MRI Room 1',
        opd_escort_id: 16,
        opd_escort_name: 'OPD Escort 1 (OPD)',
        dept_escort_id: 23,
        dept_escort_name: 'Radiology Escort 1 (Radiology)',
        mode: 'WHEELCHAIR',
        priority: 'HIGH_PRIVILEGED',
        status: 'HANDOVER_PENDING',
        requested_at: new Date(Date.now() - 15 * 60000),
        assigned_at: new Date(Date.now() - 14 * 60000),
        picked_up_at: new Date(Date.now() - 10 * 60000),
        arrived_at_dept_at: new Date(Date.now() - 2 * 60000),
        handover_accepted_at: null,
        delivered_at: null,
        notes: 'Privileged Patient - Direct MRI Transfer'
      },
      {
        id: 1002,
        patient_name: 'Priya Verma',
        patient_uhid: 'STV-2026-892',
        origin_dept: 'OPD',
        origin_cabin_id: 4,
        is_privileged: false,
        dest_dept: 'Physiotherapy',
        dest_room: 'Rehab Gym 2',
        opd_escort_id: 17,
        opd_escort_name: 'OPD Escort 2 (OPD)',
        dept_escort_id: 21,
        dept_escort_name: 'Physio Escort 1 (Physiotherapy)',
        mode: 'WALKING',
        priority: 'NORMAL',
        status: 'ASSIGNED',
        requested_at: new Date(Date.now() - 5 * 60000),
        assigned_at: new Date(Date.now() - 4 * 60000),
        picked_up_at: null,
        arrived_at_dept_at: null,
        handover_accepted_at: null,
        delivered_at: null,
        notes: 'Spine Consultant Assessment'
      }
    ];

    console.log('⚡ MemoryStore Initialized with Real Users & Handover Protocol');
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async query(sql, params = []) {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('select * from users')) return [this.users];
    if (lowerSql.includes('select * from cabins')) return [this.cabins];
    if (lowerSql.includes('select * from escorts')) return [this.escorts];
    if (lowerSql.includes('select * from trips')) return [this.trips];
    return [[]];
  }
}

const memoryStore = new MemoryStore();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'patient_escort_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  pool,
  memoryStore
};
