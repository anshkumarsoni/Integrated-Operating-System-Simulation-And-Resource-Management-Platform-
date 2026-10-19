import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { 
  testConnection, 
  setConnection, 
  initDatabaseAndSchema, 
  executeSQL, 
  getStatus,
  getActiveConfig,
  getAccounts,
  resetAccounts,
  executeTransaction,
  explainQuery,
  getViewData,
  DATABASE_VIEW_DEFINITIONS
} from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'OS Simulation Platform MySQL Bridge'
  });
});

// Database connectivity status
app.get('/api/db/status', async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Test MySQL credentials
app.post('/api/db/test', async (req, res) => {
  try {
    const { host, port, user, password } = req.body;
    const result = await testConnection({
      host: host || 'localhost',
      port: parseInt(port || '3306', 10),
      user: user || 'root',
      password: password || ''
    });
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Connect and activate pool
app.post('/api/db/connect', async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;
    const result = await setConnection({
      host: host || 'localhost',
      port: parseInt(port || '3306', 10),
      user: user || 'root',
      password: password || '',
      database: database || 'os_simulation_db'
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Initialize Schema (creates database, tables & default seed records)
app.post('/api/db/init-schema', async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;
    const result = await initDatabaseAndSchema({
      host: host || 'localhost',
      port: parseInt(port || '3306', 10),
      user: user || 'root',
      password: password || '',
      database: database || 'os_simulation_db'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Execute raw SQL query from frontend console
app.post('/api/db/execute', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ success: false, error: 'Query string required' });
    }
    const result = await executeSQL(sql);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message, code: err.code });
  }
});

// Synchronize live frontend simulation state into MySQL tables
app.post('/api/db/sync-simulation', async (req, res) => {
  try {
    const { processes, memoryBlocks, resources, systemCalls } = req.body;

    // 1. Sync processes if provided
    if (Array.isArray(processes) && processes.length > 0) {
      for (const p of processes) {
        await executeSQL(`
          INSERT INTO processes (pid, name, state, arrival_time, burst_time, priority, memory_required, cpu_time_used, io_required, resource_required)
          VALUES ('${p.pid}', '${p.name}', '${p.state}', ${p.arrival_time || 0}, ${p.burst_time || 1}, ${p.priority || 5}, ${p.memory_required || 64}, ${p.cpu_time_used || 0}, ${p.io_required ? 1 : 0}, ${p.resource_required ? `'${p.resource_required}'` : 'NULL'})
          ON DUPLICATE KEY UPDATE 
            state='${p.state}', 
            cpu_time_used=${p.cpu_time_used || 0}, 
            priority=${p.priority || 5};
        `);
      }
    }

    res.json({ success: true, message: 'Simulation state synchronized with MySQL tables successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 1. ACID Transaction Simulation Endpoints
// ----------------------------------------------------
app.get('/api/db/accounts', async (req, res) => {
  try {
    const accounts = await getAccounts();
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/accounts/reset', async (req, res) => {
  try {
    const accounts = await resetAccounts();
    res.json({ success: true, accounts, message: 'Demo account balances reset to initial states.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/transaction/simulate', async (req, res) => {
  try {
    const { fromId, toId, amount, simulateCrash } = req.body;
    const result = await executeTransaction({
      fromId: parseInt(fromId || 1, 10),
      toId: parseInt(toId || 2, 10),
      amount: parseFloat(amount || 100),
      simulateCrash: Boolean(simulateCrash)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. SQL Query Optimizer (EXPLAIN) Endpoint
// ----------------------------------------------------
app.post('/api/db/explain', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ success: false, error: 'Query required' });
    const result = await explainQuery(sql);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. Database Views & Summary Tables Endpoints
// ----------------------------------------------------
app.get('/api/db/views', (req, res) => {
  res.json({ success: true, views: DATABASE_VIEW_DEFINITIONS });
});

app.get('/api/db/views/:viewName', async (req, res) => {
  try {
    const result = await getViewData(req.params.viewName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 OS Simulation Platform MySQL Bridge`);
  console.log(`📡 Server running at http://localhost:${PORT}`);
  console.log(`🗄️ Target MySQL Host: localhost:3306`);
  console.log(`=======================================================`);
});
