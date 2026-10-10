import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let activePool = null;
let currentConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'os_simulation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

export const getActiveConfig = () => ({
  host: currentConfig.host,
  port: currentConfig.port,
  user: currentConfig.user,
  database: currentConfig.database,
  hasPassword: Boolean(currentConfig.password)
});

// Test raw credentials without switching the active pool
export async function testConnection(config = {}) {
  const merged = { ...currentConfig, ...config };
  let connection = null;
  try {
    connection = await mysql.createConnection({
      host: merged.host,
      port: merged.port,
      user: merged.user,
      password: merged.password,
      connectTimeout: 5000
    });
    const [rows] = await connection.query('SELECT VERSION() AS version, CURRENT_USER() AS user;');
    return {
      success: true,
      version: rows[0]?.version || 'MySQL 8.x',
      user: rows[0]?.user,
      message: 'Successfully reached MySQL server.'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      code: err.code
    };
  } finally {
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }
  }
}

// Connect and set as the active application pool
export async function setConnection(config = {}) {
  const merged = {
    ...currentConfig,
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true
  };

  // Close existing pool if any
  if (activePool) {
    try { await activePool.end(); } catch (_) {}
    activePool = null;
  }

  // First verify credentials against MySQL
  const testRes = await testConnection(merged);
  if (!testRes.success) {
    throw new Error(testRes.error || 'Failed to authenticate with MySQL server');
  }

  // Create new pool
  activePool = mysql.createPool({
    host: merged.host,
    port: merged.port,
    user: merged.user,
    password: merged.password,
    database: merged.database,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true
  });

  currentConfig = merged;
  return { success: true, config: getActiveConfig(), version: testRes.version };
}

// Automatically create database and all 10 tables + initial seeds
export async function initDatabaseAndSchema(config = {}) {
  const targetConfig = { ...currentConfig, ...config };
  let conn = null;
  try {
    // 1. Connect without database to ensure database exists
    conn = await mysql.createConnection({
      host: targetConfig.host,
      port: targetConfig.port,
      user: targetConfig.user,
      password: targetConfig.password,
      multipleStatements: true
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema script
    await conn.query(schemaSQL);

    // Switch active pool to the database
    await setConnection({ ...targetConfig, database: targetConfig.database || 'os_simulation_db' });

    // Fetch created tables
    const [tables] = await activePool.query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);

    return {
      success: true,
      database: targetConfig.database || 'os_simulation_db',
      tableCount: tableNames.length,
      tables: tableNames,
      message: `Database '${targetConfig.database || 'os_simulation_db'}' initialized with ${tableNames.length} tables.`
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      try { await conn.end(); } catch (_) {}
    }
  }
}

// Execute arbitrary SQL statement via active pool
export async function executeSQL(sqlStr) {
  if (!activePool) {
    throw new Error('Not connected to MySQL. Please configure and connect to your PC MySQL database first.');
  }

  const trimmed = (sqlStr || '').trim();
  if (!trimmed) {
    throw new Error('SQL statement cannot be empty.');
  }

  const start = performance.now();
  const [results, fields] = await activePool.query(trimmed);
  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  // Handle SELECT / SHOW / DESCRIBE queries (results is an array of row objects)
  if (Array.isArray(results)) {
    const columns = fields ? fields.map(f => f.name) : (results[0] ? Object.keys(results[0]) : []);
    return {
      success: true,
      isQuery: true,
      columns,
      rows: results,
      rowCount: results.length,
      durationMs
    };
  }

  // Handle INSERT / UPDATE / DELETE / DDL queries
  return {
    success: true,
    isQuery: false,
    affectedRows: results.affectedRows || 0,
    insertId: results.insertId || null,
    message: results.message || `Query OK, ${results.affectedRows || 0} row(s) affected`,
    durationMs
  };
}

// Get current connectivity status and database info
export async function getStatus() {
  if (!activePool) {
    return {
      connected: false,
      config: getActiveConfig(),
      message: 'Disconnected from PC MySQL'
    };
  }

  try {
    const [ver] = await activePool.query('SELECT VERSION() AS version, DATABASE() AS `database`;');
    const [tables] = await activePool.query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);

    return {
      connected: true,
      config: getActiveConfig(),
      version: ver[0]?.version,
      database: ver[0]?.database,
      tableCount: tableNames.length,
      tables: tableNames
    };
  } catch (err) {
    return {
      connected: false,
      config: getActiveConfig(),
      error: err.message
    };
  }
}
