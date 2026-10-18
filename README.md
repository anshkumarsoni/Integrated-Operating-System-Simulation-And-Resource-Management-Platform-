# Integrated Operating System Simulation & Resource Management Platform

> **Academic Project:** 3rd-Year B.Tech Computer Science & Engineering  
> **Domain:** Operating Systems, Relational DBMS Architecture, Algorithmic Heuristics, Full-Stack Simulation  
> **Technology Stack:** React 18, Vite, Tailwind CSS, Node.js (Express), MySQL 8.0/8.4+ (InnoDB), JavaScript (ES6+)  

---

## 📌 Abstract & Project Overview

This project presents an integrated educational workbench that bridges core Operating System (OS) mechanics, relational database architectures (DBMS), and discrete algorithmic modeling. Designed to demystify low-level kernel abstractions, the platform delivers interactive, real-time visualization of process lifecycle orchestration, processor dispatching, multi-tier memory management, and concurrent resource arbitration.

At its foundation, the system governs task execution through fully synchronized **Process Control Blocks (PCBs)**, dynamically tracking identifier tags, arrival stamps, burst demands, priority tiers, and volatile register contexts across classical state transitions (*NEW, READY, RUNNING, WAITING, TERMINATED*).

The platform couples an **in-browser algorithmic engine** with a dedicated **Node.js backend bridge** connected to a live **MySQL 8.0/8.4+ database**, ensuring that simulation telemetry, hardware snapshots, and algorithmic benchmarks are persistently recorded rather than ephemeral.

---

## 🏛️ Updated Project Approach & 5-Layer Architecture

The system is engineered around a decoupled five-tier modular architecture designed to emulate kernel-level operations with deterministic precision while preserving strict state invariants across Process Control Blocks (PCBs):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: PRESENTATION & VISUAL DASHBOARD                        │
│    Reactive Telemetry, Interactive Gantt Charts, Dynamic Memory Maps, SQL Console     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   LAYER 2: AUTONOMOUS SCENARIO & WORKLOAD ANALYZER                     │
│    Coefficient of Variation (CV = σ/μ) | Arrival Dispersion | Convoy Hazard Detection   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: CORE KERNEL SIMULATION SUBSYSTEMS                          │
│  ┌───────────────────────┬──────────────────────────┬───────────────────────────────┐  │
│  │   CPU Dispatch Engine │    Memory Subsystem      │   Concurrency & Deadlock      │  │
│  │ • FCFS, SJF, SRTF     │ • Contiguous Allocators  │ • Dijkstra's Banker's Safety  │  │
│  │ • Quantum Round Robin │ • Demand Paging (LRU/OPT)│ • Mutex Locks & Semaphores    │  │
│  │ • Preemptive Priority │ • Fragmentation Tracker  │ • Directed RAG Cycle Analyzer │  │
│  └───────────────────────┴──────────────────────────┴───────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┬───────────────────────────────┐  │
│  │             Device I/O & Disk Scheduling         │   Virtual File System (VFS)   │  │
│  │ • FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK         │ • Inode Hierarchy & Syscalls  │  │
│  └──────────────────────────────────────────────────┴───────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   LAYER 4: IN-MEMORY DATA PLANE & SIMULATION CACHE                     │
│    Zero-Latency State Bus, PCB Context Dispatcher, Event Bus Telemetry Logger          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                LAYER 5: RELATIONAL DATA PERSISTENCE & MYSQL STORAGE ENGINE             │
│    Node.js Express Bridge | ACID Transactions | MySQL 8.0/8.4+ InnoDB Relational Store │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Comprehensive Subsystem Modules & Features

### 1. 🤖 Scenario-Adaptive CPU Scheduling Engine (`/cpu-scheduling`)
* **Dual Operation Disciplines:**
  * **Automatic Mode (AI Heuristic):** Inspects incoming task queues, computes burst variance ($\sigma/\mu$), checks arrival dispersion, detects Convoy hazards, and auto-dispatches the mathematically optimal scheduling policy.
  * **Manual Mode:** Grants granular control over `FCFS`, `SJF`, `SRTF`, `Round Robin` (with dynamic time quantum $q$), and `Preemptive Priority`.
* **Autonomous Decision Heuristics:**
  * 🛡️ *Critical Priority Jobs ($\text{Priority} \le 2$)* $\rightarrow$ **Priority (Preemptive)**
  * ⚡ *Convoy Effect Hazard (Long initial burst blocking short jobs)* $\rightarrow$ **SRTF (Preemptive SJF)**
  * 📊 *Batch Submissions with High Variance ($AT=0, CV \ge 0.35$)* $\rightarrow$ **SJF (Non-Preemptive)**
  * 🔄 *Interactive Time-Sharing Workloads* $\rightarrow$ **Round Robin** (calibrated with 80th-percentile quantum)
  * ⏱️ *Uniform Arrival Queues ($CV \le 0.15$)* $\rightarrow$ **FCFS**
* **Metrics Computed:** Waiting Time ($WT$), Turnaround Time ($TAT$), Response Time ($RT$), and Core Utilization.

### 2. 🗄️ MySQL 8.0/8.4+ Database Hub & SQL Console (`/sql-database`)
* **Host PC MySQL Integration:** Communicates over TCP port `3306` with your local MySQL Server via a Node.js Express bridge (`http://localhost:5000`).
* **Interactive SQL Terminal:** Allows executing standard SQL queries (`SELECT`, `JOIN`, `WHERE`, `GROUP BY`, `INSERT`) against real database tables with sub-millisecond execution telemetry.
* **1-Click Table Initialization:** Automated script creates `os_simulation_db` and all 10 normalized relational tables with sample records.
* **State Synchronization:** "Sync OS State" button flushes live simulated processes, memory partitions, and resources directly to MySQL.
* **In-Memory Fallback:** Automatically switches to client-side SQL emulation if MySQL is offline.

### 3. 🖹 Process Management & PCB Inspector (`/processes`)
* **5-State Process Lifecycle:** Strict validation across `NEW`, `READY`, `RUNNING`, `WAITING`, and `TERMINATED`.
* **Hardware Context & PCB Modal:** Inspects Program Counter (`0x00401000`), CPU registers (`EAX`, `EBX`, `ECX`, `EDX`), memory allocation bounds, assigned virtual pages, held resources, and active threads.

### 4. 💾 Dynamic Memory Partitioning & Fragmentation (`/memory-management`)
* **Contiguous Placement Strategies:** Models 1024 MB physical address space using **First-Fit**, **Best-Fit**, and **Worst-Fit**.
* **Fragmentation Telemetry:** Real-time computation of internal fragmentation (wasted partition capacity) and external fragmentation (unusable scattered holes).
* **Hole Coalescing:** Dynamically merges adjacent free partitions upon process deallocation.

### 5. 📄 Virtual Memory & Demand Paging (`/virtual-memory`)
* **Demand Paging Simulator:** Simulates physical frame caches (1 to 8 frames) over custom or preset page reference strings.
* **Page Replacement Policies:** Evaluates **FIFO**, **LRU (Least Recently Used)**, and **Belady's Optimal** algorithm.
* **Telemetry:** Visual step-by-step frame state tables, hit/miss flags, and **Page Fault Ratios ($PFR$)**.

### 6. 🛡️ Deadlock Avoidance & Banker's Algorithm (`/deadlock-management`)
* **Dijkstra’s Banker’s Safety Test:** Real-time matrix computation of Allocation, Maximum, Need ($Max - Alloc$), and Available vectors.
* **Safe Sequence Solver:** Determines executable sequences (e.g., `<P1, P3, P4, P0, P2>`) with mathematical proof logs.
* **Directed Resource Allocation Graph (RAG):** Interactive canvas visualizing process-resource request/hold edges and circular wait cycles.

### 7. 🧵 Threads & Concurrency Synchronization (`/threads-sync`)
* **Thread Hierarchy:** Multi-threaded process workers.
* **Synchronization Primitives:** Simulates **Mutex Locks** and **Counting Semaphores**.
* **Race Condition Isolation:** Demonstrates non-atomic concurrent access corruption versus synchronized lock protection.

### 8. 💽 Device I/O & Disk Scheduling (`/io-management`)
* **Asynchronous Device Queues:** Request management for secondary storage, printer, and network controllers.
* **Disk Arm Trajectory Algorithms:** Simulates **FCFS**, **SSTF**, **SCAN (Elevator)**, **C-SCAN**, **LOOK**, and **C-LOOK**.
* **Seek Telemetry:** Calculates total cylinder head movement and plots visual head traversal paths.

### 9. 📁 Virtual File System & System Call Auditing (`/file-system` & `/system-calls`)
* **UNIX Inode Hierarchy:** Tree explorer (`/`, `/bin`, `/etc`, `/home`, `/logs`) with file creation, size tracking, and POSIX permissions (`rwxr-xr-x`).
* **Kernel Trap Interceptor:** Timestamped audit trail of kernel system calls (`sys_fork`, `sys_read`, `sys_sem_wait`, `sys_brk`).

### 10. 🔐 Dual-Mode Authentication & Academic RBAC (`/login`)
* **Role-Based Profiles:** *Administrator*, *OS Student / Researcher*, *Faculty / Professor*, and *Systems Engineer*.
* **Session Persistence:** Secure credential storage and instant role switching.

---

## 🗃️ MySQL Relational Schema Reference (10 Tables)

The persistent database layer is structured across 10 normalized tables in `os_simulation_db`:

| # | Table Name | Engine | Primary Key | Description |
| :-: | :--- | :---: | :---: | :--- |
| 1 | `users` | InnoDB | `id` | Academic authentication credentials and user access roles |
| 2 | `processes` | InnoDB | `pid` | Process queue table with burst times, arrival stamps, and lifecycle states |
| 3 | `pcb` | InnoDB | `pid` | Process Control Blocks tracking CPU registers, program counter, and memory limits |
| 4 | `memory_allocations` | InnoDB | `block_id` | Physical 1024 MB RAM partitions and internal fragmentation metrics |
| 5 | `resources` | InnoDB | `id` | Multi-instance system resources (R1–R4) and allocation matrix |
| 6 | `system_calls` | InnoDB | `id` | Audit log of user-to-kernel mode POSIX system call traps |
| 7 | `filesystem_nodes` | InnoDB | `id` | Hierarchical inodes, directory paths, file sizes, and POSIX permissions |
| 8 | `threads` | InnoDB | `thread_id`| Lightweight execution threads bound to parent process PIDs |
| 9 | `io_requests` | InnoDB | `request_id`| Secondary storage device queue and target cylinder tracks |
| 10| `execution_history` | InnoDB | `id` | Global kernel event timeline and module execution logs |

---

## 👥 3-Member Task Allocation Matrix

| Member | Project Role | Modules & Deliverables | Primary Stack |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Kernel Engine & CPU Scheduling Lead** | • PCB State Machine (`NEW` $\rightarrow$ `TERMINATED`)<br>• Autonomous Scenario-Driven Heuristic Engine<br>• Dual-Mode CPU Optimizer (Auto vs. Manual)<br>• Execution Gantt Chart Visualizer | React 18, JavaScript (ES6+), Mathematical Heuristics, Vite |
| **Member 2** | **Memory & Deadlock Safety Lead** | • Contiguous Allocator (First/Best/Worst Fit)<br>• Demand Paging Simulator (FIFO/LRU/Optimal)<br>• Dijkstra's Banker's Matrix & Safe Sequence Engine<br>• Mutex & Semaphore Synchronization | Dynamic Partitioning, Matrix Math, Concurrency Models |
| **Member 3** | **Database, Backend & Storage Lead** | • Node.js Express MySQL Bridge Server (`port 5000`)<br>• MySQL 8.0/8.4+ 10-Table Relational Schema<br>• Interactive SQL Query Console & State Sync<br>• Disk Scheduling (SSTF/SCAN/LOOK) & Virtual FS | MySQL 8.4 (InnoDB), Node.js, Express, Tailwind CSS, Full-Stack |

---

## 🚀 Installation & Setup Guide

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** (v9.0 or higher)
* **MySQL Server 8.0 or 8.4+** (installed and running locally on port `3306`)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/anshkumarsoni/Integrated-Operating-System-Simulation-And-Resource-Management-Platform-.git
cd Integrated-Operating-System-Simulation-And-Resource-Management-Platform-
```

---

### Step 2: Configure MySQL Password
Open `backend/.env` in a text editor and enter your local MySQL root password:
```env
PORT=5000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=os_simulation_db
```

---

### Step 3: Initialize Database & Tables
Run the automated initialization script from the root folder:
```bash
npm run init:db
```
*This automatically connects to your MySQL server, creates the `os_simulation_db` database, builds all 10 tables, and inserts initial seed data.*

---

### Step 4: Start the MySQL Bridge Backend
```bash
npm run server
```
*The backend server will launch at `http://localhost:5000` and establish a live connection to MySQL on port `3306`.*

---

### Step 5: Start the Frontend Application
Open a new terminal window and run:
```bash
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🔑 Default Login Credentials
* **Administrator:** `username: admin` | `password: admin123`
* **Student:** `username: student` | `password: student123`
* *(Or use the "Register New User" tab to create your own custom academic account)*

---

## 🧪 Production Build & Verification

To verify that the frontend compiles cleanly with zero warnings or errors:
```bash
npm run build
```
* **Status:** Clean production bundle compiled via Vite (**Exit Code: 0**, 1415 modules transformed).
* **Execution Latency:** Zero thread blocking, sub-millisecond execution times across all algorithmic modules.

---

## 📄 License & Academic Attribution
Developed as an academic capstone project for **3rd-Year B.Tech Computer Science & Engineering**. Distributed under the **MIT License**.
