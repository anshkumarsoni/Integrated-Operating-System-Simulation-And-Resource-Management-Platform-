# File-by-File Architectural Guide
## Operating System Simulation & Resource Management Platform (v2.0)

This document provides a detailed, file-by-file explanation of the entire project repository.

---

## Table of Contents
1. [Root Directory Files](#1-root-directory-files)
2. [Backend Directory (`backend/`)](#2-backend-directory-backend)
3. [Backend Simulation Engine (`backend/simulation/`)](#3-backend-simulation-engine-backendsimulation)
4. [Frontend Root Configuration (`frontend/`)](#4-frontend-root-configuration-frontend)
5. [Frontend Source Root (`frontend/src/`)](#5-frontend-source-root-frontendsrc)
6. [Frontend Pages (`frontend/src/pages/`)](#6-frontend-pages-frontendsrcpages)
7. [Frontend UI Components (`frontend/src/components/`)](#7-frontend-ui-components-frontendsrccomponents)
8. [Frontend DBMS Components (`frontend/src/components/dbms/`)](#8-frontend-dbms-components-frontendsrccomponentsdbms)
9. [Frontend Simulation Engines (`frontend/src/simulation/`)](#9-frontend-simulation-engines-frontendsrcsimulation)
10. [Frontend Services & API Layer (`frontend/src/services/` & `api/`)](#10-frontend-services--api-layer-frontendsrcservices--api)
11. [Frontend State & Context Providers (`frontend/src/context/` & `hooks/`)](#11-frontend-state--context-providers-frontendsrccontext--hooks)
12. [Frontend Utilities & Data Defaults (`frontend/src/utils/` & `data/`)](#12-frontend-utilities--data-defaults-frontendsrcutils--data)

---

## 1. Root Directory Files

### `run_all.bat`
- **Location**: `run_all.bat`
- **What It Contains**: A Windows batch script that acts as the one-click master launcher for the entire project.
- **Detailed Working**: When double-clicked, it opens two distinct command prompt windows simultaneously:
  1. Window 1 starts the Python Flask backend server (`run_backend.bat` on port `5000`).
  2. Window 2 starts the React Vite frontend server (`run_frontend.bat` on port `5173`).
- **Why It Matters**: Eliminates the need to open separate terminal windows and navigate directories manually.

### `README.md`
- **Location**: `README.md`
- **What It Contains**: High-level overview of the platform, technology stack summary, setup instructions, database credentials, and execution guidelines.

### `FULL_PROJECT_DOCUMENTATION.md`
- **Location**: `FULL_PROJECT_DOCUMENTATION.md`
- **What It Contains**: Complete conceptual and theoretical documentation covering all 8 operating system modules, mathematical formulas, decision trees, and a top-15 viva exam Q&A.

---

## 2. Backend Directory (`backend/`)

### `app.py`
- **Location**: `backend/app.py`
- **What It Contains**: The primary entry point for the Python REST API server, built using **Flask** and **Flask-CORS**.
- **Detailed Working**: Listens on port `5000` (`http://localhost:5000`) and defines all backend REST endpoints:
  - `GET /api/health`: Health status check verifying the Python backend is live.
  - `GET /api/db/status`: Checks if local MySQL is connected and returns the active database name and table count.
  - `POST /api/db/test`: Verifies provided MySQL host, port, user, and password credentials.
  - `POST /api/db/connect`: Establishes and activates the primary MySQL connection pool.
  - `POST /api/db/init-schema`: Executes `schema.sql` to initialize all 10 tables, 4 views, and sample data.
  - `POST /api/db/execute`: Receives raw SQL query strings from the frontend console, executes them, and returns columns, rows, and duration in milliseconds.
  - `POST /api/db/sync-simulation`: Receives active frontend processes and persists them into MySQL with `ON DUPLICATE KEY UPDATE`.
  - `GET /api/db/accounts`: Retrieves account balances for the ACID transaction demo.
  - `POST /api/db/accounts/reset`: Restores demo account balances back to default values ($1000, $500, $750).
  - `POST /api/db/transaction/simulate`: Simulates an ACID transaction with exclusive row locks (`SELECT ... FOR UPDATE`), crash injection, and rollback.
  - `POST /api/db/explain`: Runs MySQL's `EXPLAIN` optimizer command on a given SQL query and returns execution plan metrics.
  - `GET /api/db/views` & `GET /api/db/views/<name>`: Retrieves dynamic summary data from MySQL administrative views.
  - `GET /api/reports/processes`: Gathers process lifecycle metrics and PCB registers for printable audit reports.

### `db.py`
- **Location**: `backend/db.py`
- **What It Contains**: The Python database driver and connection bridge using `mysql-connector-python`.
- **Detailed Working**:
  - Manages `mysql.connector.pooling.MySQLConnectionPool` for reusable TCP connections.
  - `execute_sql(sql_str)`: Automatically distinguishes between query statements (`SELECT`, `SHOW`, `EXPLAIN`, `DESCRIBE`) which return column/row arrays, and DML/DDL statements (`INSERT`, `UPDATE`, `DELETE`, `CREATE`) which return affected row counts and execution times.
  - `execute_transaction(...)`: Implements 2-Phase Locking (2PL) by starting a formal transaction (`conn.start_transaction()`), acquiring an exclusive row lock on the sender, deducting funds, checking for crash injection, crediting the recipient, writing to the audit log, and calling `conn.commit()` or `conn.rollback()`.
  - `init_database_and_schema(...)`: Connects to MySQL without a database selected, parses `schema.sql` statement by statement, creates the schema, and switches the pool to `os_simulation_db`.

### `init_db.py`
- **Location**: `backend/init_db.py`
- **What It Contains**: A standalone Python CLI command script (`python init_db.py`).
- **Detailed Working**: Used during setup to verify MySQL server availability and build the database from the terminal with terminal log feedback.

### `schema.sql`
- **Location**: `backend/schema.sql`
- **What It Contains**: Complete SQL Data Definition Language (DDL) and Data Manipulation Language (DML) script targeting MySQL 8.0+.
- **Detailed Working**: Creates database `os_simulation_db` and builds 10 InnoDB tables:
  1. `users`: Administrative and student accounts.
  2. `processes`: Active/ready processes with burst, arrival, priority, and state.
  3. `pcb`: Hardware registers, program counters, memory limits, and thread counts.
  4. `memory_allocations`: 5 physical RAM partitions with internal fragmentation.
  5. `resources`: Multi-instance system resources ($R_1 - R_4$).
  6. `system_calls`: POSIX system call audit log.
  7. `filesystem_nodes`: Hierarchical directories and files with POSIX permissions (`rwxr-xr-x`).
  8. `threads`: Execution thread states.
  9. `io_requests`: Storage cylinder requests.
  10. `execution_history`: Kernel event timeline log.
  11. `accounts` & `transaction_audit_logs`: Tables used for ACID concurrency simulation.
  - Plus 4 SQL Views (`v_process_memory_summary`, `v_system_resource_audit`, `v_deadlock_risk_summary`, `v_kernel_execution_stats`).

### `requirements.txt`
- **Location**: `backend/requirements.txt`
- **What It Contains**: Lists the required Python packages: `flask`, `flask-cors`, `mysql-connector-python`, and `python-dotenv`.

### `.env`
- **Location**: `backend/.env`
- **What It Contains**: Environment variables for local MySQL configuration (`PORT=5000`, `MYSQL_HOST=localhost`, `MYSQL_PORT=3306`, `MYSQL_USER=root`, `MYSQL_PASSWORD=`, `MYSQL_DATABASE=os_simulation_db`).

### `run_backend.bat`
- **Location**: `backend/run_backend.bat`
- **What It Contains**: Windows batch launcher that opens a command prompt, sets the directory to `backend/`, and executes `python app.py`.

---

## 3. Backend Simulation Engine (`backend/simulation/`)

### `cpu_scheduler.py`
- **Location**: `backend/simulation/cpu_scheduler.py`
- **What It Contains**: Complete Python implementation of CPU scheduling algorithms and the **Autonomous AI Heuristic Decision Engine**.
- **Detailed Working**:
  - `run_fcfs()`: Non-preemptive First-Come First-Served algorithm.
  - `run_sjf_non_preemptive()`: Shortest Job First based on burst times.
  - `run_round_robin()`: Preemptive time-sliced scheduling with dynamic queue management.
  - `auto_select_optimal_algorithm()`: Calculates Mean Burst ($\mu$), Variance ($\sigma^2$), Coefficient of Variation ($CV$), Arrival Spread ($\Delta AT$), Convoy Risk, and Priority Divergence, matching against the 6 OS scenarios to auto-assign the best scheduling algorithm.

### `memory_manager.py`
- **Location**: `backend/simulation/memory_manager.py`
- **What It Contains**: Python memory allocation and virtual memory paging algorithms.
- **Detailed Working**:
  - `allocate_partitions()`: Implements **First Fit**, **Best Fit**, and **Worst Fit** partition allocation, calculating internal fragmentation for each block.
  - `simulate_page_replacement()`: Simulates **FIFO** and **LRU** virtual memory page replacement given a reference string and frame capacity, calculating hits, faults, and hit ratios.

### `banker_deadlock.py`
- **Location**: `backend/simulation/banker_deadlock.py`
- **What It Contains**: Python deadlock avoidance and detection engine.
- **Detailed Working**:
  - `is_safe_state()`: Implements Dijkstra's Banker's Algorithm using Allocation, Max, and Need matrices to determine if a safe execution sequence exists.
  - `detect_rag_cycle()`: Builds an adjacency list from the Resource Allocation Graph and executes Depth-First Search (DFS) with recursion stack tracking to detect circular wait cycles.

### `disk_scheduler.py`
- **Location**: `backend/simulation/disk_scheduler.py`
- **What It Contains**: Python secondary storage disk head scheduling.
- **Detailed Working**:
  - `run_scheduling()`: Implements **FCFS**, **SSTF** (Shortest Seek Time First), **SCAN** (Elevator), and **C-SCAN** (Circular SCAN) algorithms across cylinders ($0 - 199$), calculating the exact head track sequence and total seek count.

### `__init__.py`
- **Location**: `backend/simulation/__init__.py`
- **What It Contains**: Package initialization exporting `CPUScheduler`, `MemoryManager`, `BankerDeadlock`, and `DiskScheduler`.

---

## 4. Frontend Root Configuration (`frontend/`)

### `package.json`
- **Location**: `frontend/package.json`
- **What It Contains**: Defines project metadata and frontend npm dependencies (`react`, `react-dom`, `react-router-dom`, `lucide-react`, `axios`, `vite`, `tailwindcss`, `postcss`, `autoprefixer`).

### `vite.config.js`
- **Location**: `frontend/vite.config.js`
- **What It Contains**: Vite configuration enabling the React plugin and development server settings.

### `tailwind.config.js`
- **Location**: `frontend/tailwind.config.js`
- **What It Contains**: Tailwind CSS configuration specifying content scan paths and theme palette extensions.

### `postcss.config.js`
- **Location**: `frontend/postcss.config.js`
- **What It Contains**: PostCSS configuration declaring `tailwindcss` and `autoprefixer` plugins.

### `index.html`
- **Location**: `frontend/index.html`
- **What It Contains**: The HTML5 root page containing `<div id="root"></div>` where React renders the app.

### `run_frontend.bat`
- **Location**: `frontend/run_frontend.bat`
- **What It Contains**: Windows batch launcher that enters the `frontend/` folder and starts `npm run dev`.

---

## 5. Frontend Source Root (`frontend/src/`)

### `main.jsx`
- **Location**: `frontend/src/main.jsx`
- **What It Contains**: Application bootstrap script that mounts the root React component to DOM node `#root` with React 18 `createRoot` and `BrowserRouter`.

### `App.jsx`
- **Location**: `frontend/src/App.jsx`
- **What It Contains**: The core routing declaration using `react-router-dom` v6.
- **Detailed Working**: Maps all 16 client routes to their respective pages inside `DashboardLayout` (`/dashboard`, `/processes`, `/cpu-scheduling`, `/memory`, `/virtual-memory`, `/deadlock`, `/resources`, `/io`, `/filesystem`, `/system-calls`, `/threads`, `/simulation`, `/database`, `/history`, `/settings`, `/login`).

### `index.css`
- **Location**: `frontend/src/index.css`
- **What It Contains**: Global stylesheet implementing the **Calm Light Blue UI theme**.
- **Detailed Working**:
  - Configures canvas background (`#f0f7ff`) and card surfaces (`#ffffff`).
  - Overrides Tailwind slate utility classes to soft blue accents (`#e0effe`, `#dbeafe`, `#bfdbfe`).
  - Styles custom blue scrollbars and responsive table headers.

---

## 6. Frontend Pages (`frontend/src/pages/`)

### `Dashboard.jsx`
- **Location**: `frontend/src/pages/Dashboard.jsx`
- **What It Does**: Central control center displaying live system gauges (CPU utilization, RAM utilization, active process counts, resource counts) and quick navigation cards to all subsystems.

### `Processes.jsx`
- **Location**: `frontend/src/pages/Processes.jsx`
- **What It Does**: Process management table. Allows creating new processes with custom burst/priority/RAM attributes, inspecting the PCB modal, changing states (`NEW`, `READY`, `RUNNING`, `WAITING`, `TERMINATED`), permanently deleting processes via the trash button, and opening the report generator.

### `CPUScheduling.jsx`
- **Location**: `frontend/src/pages/CPUScheduling.jsx`
- **What It Does**: Visualizes CPU scheduling execution. Displays the **Kernel Autonomous Decision Engine** recommendation banner with telemetry pills (CV, arrival spread, convoy risk), provides 5 pre-built workload scenario buttons, renders the Gantt chart, and displays summary statistics.

### `MemoryManagement.jsx`
- **Location**: `frontend/src/pages/MemoryManagement.jsx`
- **What It Does**: Contiguous memory partition allocation visualizer. Renders the continuous 1024 MB physical RAM bar, partition breakdown cards, and lets users test First Fit, Best Fit, and Worst Fit algorithms on live processes.

### `VirtualMemory.jsx`
- **Location**: `frontend/src/pages/VirtualMemory.jsx`
- **What It Does**: Paging and virtual memory page replacement simulator. Users can enter a custom reference string (e.g., `7, 0, 1, 2, 0, 3, 0, 4, 2, 3`), select frame counts, test FIFO vs. LRU, and view real-time hit/fault ratios.

### `DeadlockManagement.jsx`
- **Location**: `frontend/src/pages/DeadlockManagement.jsx`
- **What It Does**: Implements Dijkstra's Banker's Algorithm safety evaluation and interactive Resource Allocation Graph (RAG) vector visualization with circular wait cycle detection.

### `ResourceManagement.jsx`
- **Location**: `frontend/src/pages/ResourceManagement.jsx`
- **What It Does**: Monitors multi-instance system hardware pools ($R_1 - R_4$), displaying allocation matrices, available instance counts, and resource claim requests.

### `IOManagement.jsx`
- **Location**: `frontend/src/pages/IOManagement.jsx`
- **What It Does**: Secondary storage disk scheduling simulator. Lets users configure cylinder queues and head positions to compare head arm movements for FCFS, SSTF, SCAN, and C-SCAN.

### `FileSystem.jsx`
- **Location**: `frontend/src/pages/FileSystem.jsx`
- **What It Does**: Virtual File System (VFS) explorer. Renders an interactive file/folder directory tree, calculates file sizes, and enforces POSIX permissions (`rwxr-xr-x`).

### `SystemCalls.jsx`
- **Location**: `frontend/src/pages/SystemCalls.jsx`
- **What It Does**: Real-time POSIX system call audit log monitoring kernel traps (`sys_fork`, `sys_read`, `sys_sem_wait`, `sys_brk`, `sys_exit`).

### `ThreadsSync.jsx`
- **Location**: `frontend/src/pages/ThreadsSync.jsx`
- **What It Does**: Thread synchronization laboratory demonstrating critical section protection, mutex locks, and the producer-consumer bounded-buffer problem.

### `IntegratedSimulation.jsx`
- **Location**: `frontend/src/pages/IntegratedSimulation.jsx`
- **What It Does**: 13-step end-to-end process lifecycle workflow simulator. Traces a single process from birth to CPU scheduling, memory mapping, I/O handling, and final reclamation.

### `SQLDatabase.jsx`
- **Location**: `frontend/src/pages/SQLDatabase.jsx`
- **What It Does**: MySQL relational database suite featuring:
  1. System Architecture Diagram.
  2. Interactive SQL query console with preset queries.
  3. ACID Transaction Simulator with 2PL locks and crash injection.
  4. Query Optimizer with `EXPLAIN` execution plans.
  5. Concurrency deadlock and lock registry viewer.
  6. Administrative summary views.
  7. Relational table schema explorer.

### `ExecutionHistory.jsx`
- **Location**: `frontend/src/pages/ExecutionHistory.jsx`
- **What It Does**: Historical audit trail of all kernel subsystem events with timestamps and status indicators.

### `Login.jsx`
- **Location**: `frontend/src/pages/Login.jsx`
- **What It Does**: Authentication portal with role-based access for Administrator and Student profiles.

### `Settings.jsx`
- **Location**: `frontend/src/pages/Settings.jsx`
- **What It Does**: Allows users to configure simulation speed, toggle auto-sync with MySQL, or reset state to defaults.

---

## 7. Frontend UI Components (`frontend/src/components/`)

- **`Navbar.jsx`**: Top navigation bar with live clock, active page title, and logged-in user profile badge.
- **`Sidebar.jsx`**: Left navigation drawer with icons and links to all 16 modules.
- **`GanttChart.jsx`**: Visual timeline chart rendering process burst blocks and idle gaps.
- **`MemoryVisualizer.jsx`**: Continuous physical memory bar and partition cards in light blue styling.
- **`DeadlockGraph.jsx`**: Interactive SVG rendering of Resource Allocation Graphs with circular wait cycle detection.
- **`FileExplorer.jsx`**: Hierarchical directory tree component with folder toggle, file creation, and delete controls.
- **`ExecutionTimeline.jsx`**: Vertical 13-step lifecycle timeline with step cards.
- **`MySQLArchitectureDiagram.jsx`**: 5-layer interactive architecture model diagram with high-contrast color cards.
- **`PCBModal.jsx`**: Modal displaying registers (`EAX`, `EBX`, `ECX`, `EDX`), program counter, base/limit registers, and priority.
- **`ProcessReportModal.jsx`**: Generates full ASCII process lifecycle reports with print and copy-to-clipboard functionality.
- **`StatusBadge.jsx`**: Colored status indicator badges for process lifecycle states.
- **`StatCard.jsx`**: Metric card displaying titles, values, and icon accents.
- **`Modal.jsx`**: Accessible modal dialog backdrop wrapper.
- **`Toast.jsx`**: Floating notification toast alert component.
- **`PageTableView.jsx`**: Tabular view for virtual memory frame allocations.
- **`ResourceTable.jsx`**: Tabular view for hardware resource allocation and availability matrices.

---

## 8. Frontend DBMS Components (`frontend/src/components/dbms/`)

- **`ACIDTransactionSimulator.jsx`**: Simulates atomic account transfers, exclusive 2PL locks, and crash injection rollbacks.
- **`ConcurrencyDeadlockViewer.jsx`**: Displays database lock registries, lock types (shared vs. exclusive), and wait-for graphs.
- **`DatabaseViewsViewer.jsx`**: Fetches and displays dynamic summary data from MySQL administrative views.
- **`QueryOptimizerAnalyzer.jsx`**: Executes `EXPLAIN` on user queries and reports index usage, full table scans, and rows examined.

---

## 9. Frontend Simulation Engines (`frontend/src/simulation/`)

- **`cpuScheduler.js`**: Client-side implementation of CPU scheduling and the **Autonomous AI Heuristic Decision Engine** (`autoSelectOptimalAlgorithm`).
- **`processManager.js`**: In-memory process collection, PCB dictionary, state transitions, and permanent process deletion.
- **`memoryManager.js`**: Manages physical 1024 MB partition allocation (First/Best/Worst Fit) and internal fragmentation.
- **`deadlockManager.js`**: Implements Banker's safety algorithm and RAG cycle detection.
- **`fileSystem.js`**: Inode directory tree builder and file manipulator.
- **`ioManager.js`**: Storage disk request queues and cylinder scheduling (FCFS, SSTF, SCAN, C-SCAN).
- **`resourceManager.js`**: Multi-instance resource pool manager ($R_1 - R_4$).
- **`systemCalls.js`**: Logs trapped POSIX system calls.
- **`threadManager.js`**: Lightweight thread scheduler and priority dispatcher.
- **`virtualMemory.js`**: Page replacement algorithms (FIFO, LRU).
- **`integratedWorkflow.js`**: 13-step lifecycle state machine engine.

---

## 10. Frontend Services & API Layer (`frontend/src/services/` & `api/`)

- **`osService.js`**: Central facade service orchestrating all subsystem managers (`processMgr`, `memoryMgr`, `resourceMgr`, `ioMgr`, `fsMgr`, `syscallMgr`) and persisting state to local storage.
- **`storageService.js`**: LocalStorage driver for browser persistence.
- **`database.js`**: Axios client calling the Python Flask backend on `http://localhost:5000/api`.
- **`api.js`**: Unified API module exporting methods for processes, CPU scheduling, memory, and database actions.

---

## 11. Frontend State & Context Providers (`frontend/src/context/` & `hooks/`)

- **`SimulationContext.jsx`**: Central React Context broadcasting real-time process lists, memory partitions, resources, threads, and dispatching operations (`createProcess`, `updateProcessState`, `deleteProcess`, `allocateMemory`).
- **`AuthContext.jsx`**: Manages user session state and authentication.
- **`ThemeContext.jsx`**: Manages application visual appearance.
- **`useSimulation.js`**: Custom hook granting one-line access to `SimulationContext`.
- **`useToast.js`**: Custom hook for triggering floating toast alerts.

---

## 12. Frontend Utilities & Data Defaults (`frontend/src/utils/` & `data/`)

- **`helpers.js`**: Utility functions including Tailwind class merger `cn()` (clsx + tailwind-merge), timestamp formatters, and numeric rounders.
- **`initialData.js`**: Default seed data for initial processes (`P101` - `P105`), partition blocks, hardware resources, and VFS tree.
- **`dataModels.js`**: Data type definitions, constants, and schema models.
