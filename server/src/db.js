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

    this.trips = [];

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
