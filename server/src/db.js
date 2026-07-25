const mysql = require('mysql2/promise');
require('dotenv').config();

// In-Memory Database Fallback with 13 Normal + 2 Privileged OPDs and Department Escort Teams
class MemoryStore {
  constructor() {
    this.users = [
      { id: 1, username: 'admin', name: 'Super Admin', role: 'Super Admin', department: null },
      { id: 2, username: 'opd_desk', name: 'OPD Desk Staff', role: 'OPD Front Desk', department: 'OPD' },
      { id: 3, username: 'rad_desk', name: 'Radiology Desk', role: 'Department Front Desk', department: 'Radiology' },
      { id: 4, username: 'physio_desk', name: 'Physiotherapy Desk', role: 'Department Front Desk', department: 'Physiotherapy' },
      { id: 5, username: 'escort1', name: 'Ramesh Kumar', role: 'Escort', department: 'OPD' },
      { id: 6, username: 'escort2', name: 'Suresh Patel', role: 'Escort', department: 'OPD' },
      { id: 7, username: 'escort3', name: 'Vikram Singh', role: 'Escort', department: 'Radiology' },
      { id: 8, username: 'escort4', name: 'Amit Shah', role: 'Escort', department: 'Physiotherapy' }
    ];

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
        assigned_escort_id: isPrivileged ? 5 : (cabinNum % 2 === 0 ? 6 : 5),
        status: 'IDLE'
      };
    });

    // Escorts categorized by Department Teams
    this.escorts = [
      { id: 5, user_id: 5, name: 'Ramesh Kumar', department: 'OPD', status: 'AVAILABLE', current_location: 'OPD Waiting Lounge' },
      { id: 6, user_id: 6, name: 'Suresh Patel', department: 'OPD', status: 'AVAILABLE', current_location: 'OPD Waiting Lounge' },
      { id: 7, user_id: 7, name: 'Vikram Singh', department: 'Radiology', status: 'AVAILABLE', current_location: 'Radiology Desk' },
      { id: 8, user_id: 8, name: 'Amit Shah', department: 'Physiotherapy', status: 'AVAILABLE', current_location: 'Physio Rehab Area' }
    ];

    // Initial trips with Handover state support
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
        opd_escort_id: 5,
        opd_escort_name: 'Ramesh Kumar (OPD)',
        dept_escort_id: 7,
        dept_escort_name: 'Vikram Singh (Radiology)',
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
        opd_escort_id: 6,
        opd_escort_name: 'Suresh Patel (OPD)',
        dept_escort_id: 8,
        dept_escort_name: 'Amit Shah (Physiotherapy)',
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

    console.log('⚡ MemoryStore Initialized with 13 Normal + 2 Privileged OPDs & Handover Protocol');
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
