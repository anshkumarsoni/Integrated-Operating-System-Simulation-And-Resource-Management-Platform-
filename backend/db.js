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

// ----------------------------------------------------
// 1. ACID TRANSACTION SIMULATOR
// ----------------------------------------------------
export async function getAccounts() {
  if (!activePool) {
    throw new Error('Not connected to MySQL');
  }
  const [rows] = await activePool.query('SELECT * FROM accounts ORDER BY account_id ASC;');
  return rows;
}

export async function resetAccounts() {
  if (!activePool) throw new Error('Not connected to MySQL');
  await activePool.query(`
    UPDATE accounts SET balance = 1000.00, quota_mb = 512, status = 'ACTIVE' WHERE account_id = 1;
    UPDATE accounts SET balance = 500.00, quota_mb = 256, status = 'ACTIVE' WHERE account_id = 2;
    UPDATE accounts SET balance = 750.00, quota_mb = 384, status = 'ACTIVE' WHERE account_id = 3;
  `);
  return await getAccounts();
}

export async function executeTransaction({ fromId = 1, toId = 2, amount = 100, simulateCrash = false }) {
  if (!activePool) throw new Error('Not connected to MySQL');

  const connection = await activePool.getConnection();
  const txId = `TX-${Date.now()}`;
  const steps = [];
  const start = performance.now();

  try {
    steps.push({ step: 'START TRANSACTION', desc: 'Acquiring transaction context and InnoDB Undo/Redo space' });
    await connection.beginTransaction();

    // 1. Check sender balance with FOR UPDATE (Exclusive Row Lock - 2PL)
    steps.push({ step: 'LOCK & READ (2PL)', desc: `SELECT balance FROM accounts WHERE account_id = ${fromId} FOR UPDATE;` });
    const [senderRows] = await connection.query('SELECT balance, owner_name FROM accounts WHERE account_id = ? FOR UPDATE;', [fromId]);
    if (!senderRows || senderRows.length === 0) {
      throw new Error(`Sender account #${fromId} not found`);
    }

    const currentBalance = parseFloat(senderRows[0].balance);
    if (currentBalance < amount) {
      throw new Error(`Insufficient funds: Balance (${currentBalance}) is less than transfer amount (${amount})`);
    }

    // 2. Deduct from Sender
    steps.push({ step: 'DEBIT SENDER', desc: `UPDATE accounts SET balance = balance - ${amount} WHERE account_id = ${fromId};` });
    await connection.query('UPDATE accounts SET balance = balance - ? WHERE account_id = ?;', [amount, fromId]);

    // 3. Simulated crash or constraint failure
    if (simulateCrash) {
      steps.push({ step: 'CRASH INJECTED', desc: 'Simulating unexpected power cut / constraint violation before crediting recipient!' });
      throw new Error('Simulated Mid-Transaction Hardware Crash / Network Partition! Triggering Automatic Rollback.');
    }

    // 4. Credit Recipient
    steps.push({ step: 'CREDIT RECIPIENT', desc: `UPDATE accounts SET balance = balance + ${amount} WHERE account_id = ${toId};` });
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE account_id = ?;', [amount, toId]);

    // 5. Audit Log Entry
    steps.push({ step: 'WRITE AUDIT LOG', desc: `INSERT INTO transaction_audit_logs ('${txId}', ${fromId}, ${toId}, ${amount}, 'SUCCESS')` });
    await connection.query(
      'INSERT INTO transaction_audit_logs (tx_id, from_account, to_account, amount, action_type, status, details) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [txId, fromId, toId, amount, 'FUND_TRANSFER', 'COMMITTED', 'ACID transaction completed successfully']
    );

    // 6. Commit
    steps.push({ step: 'COMMIT', desc: 'Flushing transaction log to InnoDB Redo Log disk buffer (Durability enforced)' });
    await connection.commit();

    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const [updatedAccounts] = await activePool.query('SELECT * FROM accounts ORDER BY account_id ASC;');

    return {
      success: true,
      status: 'COMMITTED',
      txId,
      steps,
      durationMs,
      message: 'Transaction successfully committed. All ACID invariants maintained.',
      accounts: updatedAccounts
    };
  } catch (err) {
    steps.push({ step: 'ROLLBACK TRIGGERED', desc: `ROLLBACK; -- Undoing all uncommitted changes via InnoDB Undo Log. Reason: ${err.message}` });
    await connection.rollback();

    // Log the aborted transaction
    try {
      await activePool.query(
        'INSERT INTO transaction_audit_logs (tx_id, from_account, to_account, amount, action_type, status, details) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [txId, fromId, toId, amount, 'FUND_TRANSFER', 'ROLLED_BACK', err.message]
      );
    } catch (_) {}

    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const [currentAccounts] = await activePool.query('SELECT * FROM accounts ORDER BY account_id ASC;');

    return {
      success: false,
      status: 'ROLLED_BACK',
      txId,
      steps,
      durationMs,
      error: err.message,
      message: 'Transaction rolled back. Atomicity guaranteed: No partial state was saved.',
      accounts: currentAccounts
    };
  } finally {
    connection.release();
  }
}

// ----------------------------------------------------
// 2. SQL QUERY OPTIMIZER & INDEX ANALYZER (EXPLAIN)
// ----------------------------------------------------
export async function explainQuery(sqlQuery) {
  if (!activePool) throw new Error('Not connected to MySQL');
  const trimmed = sqlQuery.trim();
  const start = performance.now();

  const [explainRows] = await activePool.query(`EXPLAIN ${trimmed}`);
  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    success: true,
    query: trimmed,
    plan: explainRows,
    durationMs,
    summary: explainRows.map(row => ({
      table: row.table,
      type: row.type, // ALL (table scan), ref, range, const, eq_ref
      possibleKeys: row.possible_keys,
      keyUsed: row.key || 'NONE (Full Table Scan)',
      rowsExamined: row.rows,
      filtered: row.filtered ? `${row.filtered}%` : '100%',
      extra: row.Extra || 'Using where'
    }))
  };
}

// ----------------------------------------------------
// 3. DATABASE VIEWS & SUMMARY TABLES
// ----------------------------------------------------
export const DATABASE_VIEW_DEFINITIONS = [
  {
    name: 'v_process_memory_summary',
    title: 'Process Memory & Fragmentation Overview',
    desc: 'Aggregates processes with RAM partition blocks, allocated megabytes, and internal fragmentation.',
    sql: 'CREATE OR REPLACE VIEW v_process_memory_summary AS SELECT p.pid, p.name AS process_name, p.state, p.priority, p.burst_time, p.memory_required, COALESCE(m.name, "Unassigned RAM") AS partition_name, COALESCE(m.size_mb, 0) AS partition_size_mb, COALESCE(m.internal_frag, 0) AS internal_frag_mb FROM processes p LEFT JOIN memory_allocations m ON p.pid = m.pid;'
  },
  {
    name: 'v_system_resource_audit',
    title: 'System Resource Saturation & Health',
    desc: 'Computes real-time capacity percentage and flags critical saturation on multi-instance hardware resources.',
    sql: 'CREATE OR REPLACE VIEW v_system_resource_audit AS SELECT r.id AS resource_id, r.name AS resource_name, r.total_instances, r.available_instances, r.allocated_instances, ROUND((r.allocated_instances / r.total_instances) * 100, 1) AS utilization_pct, CASE WHEN r.available_instances = 0 THEN "CRITICAL - SATURATED" WHEN r.available_instances = 1 THEN "WARNING - LOW CAPACITY" ELSE "HEALTHY - SAFE MARGIN" END AS health_status FROM resources r;'
  },
  {
    name: 'v_deadlock_risk_summary',
    title: 'Process Deadlock Risk Assessment',
    desc: 'Analyzes process dependency queues and flags waiting processes experiencing resource starvation as circular wait candidates.',
    sql: 'CREATE OR REPLACE VIEW v_deadlock_risk_summary AS SELECT p.pid, p.name AS process_name, p.state, COALESCE(p.resource_required, "NONE") AS resource_needed, COALESCE(r.available_instances, 0) AS units_available, CASE WHEN p.state = "WAITING" AND r.available_instances = 0 THEN "HIGH DEADLOCK RISK - CIRCULAR WAIT CANDIDATE" WHEN p.state = "WAITING" THEN "BLOCKED - WAITING FOR FREE INSTANCE" ELSE "SAFE - DISPATCHED" END AS risk_tier FROM processes p LEFT JOIN resources r ON p.resource_required = r.id;'
  },
  {
    name: 'v_kernel_execution_stats',
    title: 'Kernel Subsystem Event Statistics',
    desc: 'Summarizes logged execution events, successful operations, and blocked traps grouped by kernel module.',
    sql: 'CREATE OR REPLACE VIEW v_kernel_execution_stats AS SELECT module, COUNT(*) AS total_events, SUM(CASE WHEN status = "SUCCESS" THEN 1 ELSE 0 END) AS success_events, SUM(CASE WHEN status = "BLOCKED" THEN 1 ELSE 0 END) AS blocked_events FROM execution_history GROUP BY module;'
  }
];

export async function getViewData(viewName) {
  if (!activePool) throw new Error('Not connected to MySQL');
  const def = DATABASE_VIEW_DEFINITIONS.find(v => v.name === viewName);
  if (!def) throw new Error(`View '${viewName}' is not defined.`);

  const start = performance.now();
  const [rows, fields] = await activePool.query(`SELECT * FROM ${viewName};`);
  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    success: true,
    viewName,
    title: def.title,
    desc: def.desc,
    sql: def.sql,
    columns: fields.map(f => f.name),
    rows,
    rowCount: rows.length,
    durationMs
  };
}
