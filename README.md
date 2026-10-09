# Integrated Operating System Simulation & Resource Management Platform

> **Academic Project:** 3rd-Year B.Tech Computer Science & Engineering  
> **Domain:** Systems Software, Operating Systems, Relational DBMS Modeling, Interactive Simulation  
> **Technology Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, MySQL 8.0+ Schema (3NF), JavaScript (ES6+)

---

## 📌 Project Overview

The **Integrated Operating System Simulation and Resource Management Platform** is a full-stack, modular web environment designed to model, visualize, and benchmark the complete lifecycle of operating system kernel components. Unlike traditional fragmented simulators or command-line applets, this platform unifies all major kernel subsystems—**Process Scheduling, Memory Partitioning, Virtual Memory Demand Paging, Concurrency Synchronization, Deadlock Avoidance, Device I/O, File Systems, and MySQL Relational Persistence**—into a cohesive, real-time interactive dashboard.

A key highlight is the **Scenario-Adaptive CPU Scheduling Engine**, which utilizes statistical heuristics (Burst Variance, Arrival Dispersion, Convoy Effect Hazard Detection, and Critical Priorities) to autonomously diagnose workload patterns and assign mathematically optimal scheduling policies without manual guesswork.

---

## 🌟 Key Subsystem Modules & Features

### 1. 🔐 Dual-Mode Authentication & Multi-User Access (`/login`)
* **Dual-Tab Interface:** Seamless switching between **Sign In** and **New User Registration**.
* **Academic Role Profiles:** Supports *OS Student / Researcher*, *Faculty / Professor*, *Kernel Developer*, *Systems Engineer*, and *Academic Administrator*.
* **Session Persistence:** LocalStorage-backed user registry with duplicate validation, active user credential pill in Top Navbar & Sidebar, and quick account switching.

### 2. 🗄️ 5-Layer MySQL 8.0+ Architecture & SQL Console (`/sql-database`)
* **Interactive 5-Layer Architecture Diagram:** Visualizes complete kernel data flow across *User Layer*, *Kernel Core Engine (with bidirectional feedback loop)*, *Device I/O Controllers*, *MySQL Database Layer*, and *Analytics Dashboard*.
* **Normalized 3NF Relational Schemas:** Complete relational mapping for `processes`, `pcb_records`, `memory_partitions`, `resource_registry`, `thread_registry`, `io_request_queue`, `system_call_audit`, and `execution_history`.
* **In-Memory SQL Console:** Live SQL query evaluator supporting `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `SHOW TABLES`, and `DESCRIBE`.

### 3. 🤖 Scenario-Adaptive CPU Scheduling Engine (`/cpu-scheduling`)
* **Two Operational Modes:**
  * **Mode 1 — Automatic Mode (Default):** The kernel autonomously inspects the active process queue, evaluates workload telemetry, diagnoses the scenario, and auto-assigns the optimal algorithm without user intervention.
  * **Mode 2 — Manual Mode:** Unlocks manual controls for `FCFS`, `SJF`, `Priority`, `Round Robin`, `Preemptive Mode` toggle, and `Time Quantum (q)` input.
* **Autonomous Decision Matrix:**
  * 🛡️ *Critical Priority Tasks ($\text{Priority} \le 2$)* $\rightarrow$ **Priority (Preemptive)**
  * ⚡ *Convoy Effect Hazard (Long job at $t=0$ blocking short jobs)* $\rightarrow$ **SRTF (Preemptive SJF)**
  * 📊 *Batch Submissions with High Variance ($AT=0, CV \ge 0.35$)* $\rightarrow$ **SJF (Non-Preemptive)**
  * 🔄 *Multi-User Interactive Time-Sharing* $\rightarrow$ **Round Robin** (with 80th-percentile calibrated quantum $q$)
  * ⏱️ *Homogeneous Sequential Queue ($CV \le 0.15$)* $\rightarrow$ **FCFS (FIFO)**
* **Loop Safety & Anti-Freeze Architecture:** Clamped input normalization (`CPUScheduler.normalizeProcessList`), hard loop safety guards (`cycles < maxCycles`), and direct timeline arrival jumping ensuring 100% crash-proof, sub-millisecond execution.
* **Sample Real-World Workload Profiles:** 1-click loading for Workloads A through E + Inline Custom Process Builder.

### 4. 🖹 Process Management & PCB Inspector (`/processes`)
* **5-State Lifecycle:** Visual state transitions across `NEW`, `READY`, `RUNNING`, `WAITING`, and `TERMINATED`.
* **Deep PCB Inspection Modal:** Detailed tracking of Program Counter (`PC`), CPU registers (`EAX`, `EBX`, `ECX`, `EDX`), memory allocation bounds, assigned virtual pages, held resources, and active thread counts.

### 5. 💾 Dynamic Memory Partitioning & Fragmentation (`/memory-management`)
* **Contiguous Memory Allocator:** Simulates a 1024 MB physical address space using **First-Fit**, **Best-Fit**, and **Worst-Fit** algorithms.
* **Live Fragmentation Telemetry:** Computes exact **Internal Fragmentation** (within allocated blocks) and **External Fragmentation** (scattered unallocated holes) in real time.
* **Dynamic Hole Coalescing:** Automatically merges adjacent free memory blocks upon process termination.

### 6. 📄 Virtual Memory & Demand Paging (`/virtual-memory`)
* **Multi-Frame Demand Paging:** Models physical frame allocations (1 to 8 frames) over dynamic page reference strings.
* **Page Replacement Policies:** Evaluates **FIFO**, **LRU (Least Recently Used)**, and **Optimal** algorithms.
* **Real-Time PFR Telemetry:** Outputs visual step-by-step frame allocation tables, Page Hit/Miss counts, and **Page Fault Ratios ($PFR$)**.

### 7. 🛡️ Deadlock Management & Dijkstra’s Banker’s Algorithm (`/deadlock-management`)
* **Banker’s Safety Verifier:** Dynamic matrix evaluation for Allocation, Maximum, Need ($Max - Alloc$), and Available vectors.
* **Automated Safe Sequence Discovery:** Computes valid execution sequences (e.g., `<P1, P3, P4, P0, P2>`) with mathematical proofs.
* **Resource Allocation Graph (RAG):** Dynamic SVG-based canvas visualizing resource hold-and-wait cycles and deadlock recovery mechanisms.

### 8. 🧵 Threads & Concurrency Synchronization (`/threads-sync`)
* **Multi-Threaded Spawner:** Hierarchical thread management per process.
* **Concurrency Primitives:** Interactive critical section simulation modeling **Mutex Locks** and **Counting Semaphores**.
* **Race Condition Isolation:** Demonstrates non-atomic concurrent access anomalies versus synchronized lock protection with microsecond timelines.

### 9. 💽 Device I/O & Disk Head Scheduling (`/io-management`)
* **Asynchronous Device Queues:** Multi-device request queues for Disk, Printer, Network, and Console.
* **Disk Arm Trajectory Algorithms:** Simulates **FCFS**, **SSTF**, **SCAN (Elevator)**, **C-SCAN**, **LOOK**, and **C-LOOK**.
* **Seek Optimization Analytics:** Calculates total cylinder head movements and renders visual arm traversal paths.

### 10. 📁 Virtual File System & System Call Auditing (`/file-system` & `/system-calls`)
* **UNIX-Style Virtual Tree:** Hierarchical folder exploration (`/`, `/Documents`, `/Backup`, `/Logs`) with file creation, editing, and permission masks (`rwxr-xr-x`).
* **Kernel System Call Interceptor:** Intercepts, timestamps, and logs low-level kernel traps (`create_process()`, `allocate_memory()`, `request_io()`, `request_resource()`).

### 11. 🚀 Flagship End-to-End Integrated Simulation (`/integrated-simulation`)
* **Synchronized 13-Step Pipeline:** Demonstrates cross-module coordination as a single process moves from creation, memory allocation, CPU dispatch, I/O blocking, semaphore acquisition, disk writing, and termination across all dashboard modules simultaneously.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: USER INTERACTION & DASHBOARD LAYER                     │
│    Dual-Mode Control (1. Automatic Scenario-Driven | 2. Manual), Role-Based Auth UI   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   LAYER 2: AUTONOMOUS SCENARIO & TELEMETRY ENGINE                      │
│     • Burst Variance (CV = σ/μ)         • Arrival Dispersion (ΔAT)                     │
│     • Convoy Effect Hazard Detector     • 80th-Percentile Quantum Calibration          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 3: CORE KERNEL SIMULATION SUBSYSTEMS                       │
│  ┌───────────────────────┬──────────────────────────┬───────────────────────────────┐  │
│  │   CPU Scheduler       │    Memory Management     │   Deadlock & Synchronization  │  │
│  │ • Autonomous SRTF/SJF │ • First/Best/Worst Fit   │ • Dijkstra's Banker's Safety  │  │
│  │ • Round Robin / FCFS  │ • Demand Paging (LRU/OPT)│ • Semaphores / Mutex / RAG    │  │
│  │ • Preemptive Priority │ • Fragmentation Tracker  │ • Race Condition Isolation    │  │
│  └───────────────────────┴──────────────────────────┴───────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┬───────────────────────────────┐  │
│  │             Device I/O & Storage Subsystem       │   System Calls & File System  │  │
│  │ • Disk Scheduling (SSTF, SCAN, LOOK, C-SCAN)     │ • Hierarchical Virtual Tree   │  │
│  │ • Asynchronous I/O Device Request Queues         │ • Audit Logger (Syscall Traces)│  │
│  └──────────────────────────────────────────────────┴───────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                LAYER 4: RELATIONAL DATA PERSISTENCE & AUDIT TRAIL LAYER                │
│    Normalized MySQL 8.0+ Schema (3NF) | Process State Records | In-Memory SQL Console  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 5: REAL-TIME ANALYTICS & VISUALIZATION LAYER                  │
│    Execution Gantt Charts | Memory Partition Maps | Frame Telemetry | Comparative Stats │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 3-Member Task Allocation Matrix

| Member | Assigned Project Role | Core Modules & Deliverables | Primary Technologies |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Kernel Engine & CPU Scheduling Lead** | • PCB State Machine (`NEW` $\rightarrow$ `TERM`)<br>• Scenario-Driven CPU Optimizer<br>• Dual-Mode (Auto vs Manual)<br>• Loop-Safety Fixes & Gantt Visualizer | React 18, JavaScript (ES6+), Mathematical Heuristics, Vite |
| **Member 2** | **Memory & Deadlock Safety Lead** | • Dynamic Memory (First/Best/Worst Fit)<br>• Virtual Paging (FIFO/LRU/Optimal)<br>• Banker's Algorithm & Safe Sequences<br>• Thread Semaphores & Mutex Sync | Matrix Math, Dynamic Partitioning, Concurrency Models |
| **Member 3** | **Database, Storage & UI/UX Lead** | • 5-Layer MySQL Relational Architecture<br>• In-Memory SQL Console & State Persistence<br>• Disk Scheduling (SSTF/SCAN/LOOK)<br>• Role-Based Login & VFS Directory Tree | MySQL 8.0+ 3NF Schema, Tailwind CSS, Lucide Icons, Full-Stack |

---

## 🚀 Getting Started & Installation

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** (v9.0 or higher)

### Setup & Launch Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd os-simulation-platform/frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Default Login Credentials
* **Username:** `admin` | **Password:** `admin123` *(Administrator)*
* **Username:** `student` | **Password:** `student123` *(OS Student / Researcher)*
* *(Or use the "Register New User" tab to create your own custom academic account)*

---

## 🧪 Production Build & Verification

To verify production readiness and bundling:

```bash
cd os-simulation-platform/frontend
npm run build
```

* **Output:** Clean production bundle compiled with **Vite** (**Exit Code: 0**, 1415 modules transformed).
* **Latency:** Zero browser freezing, sub-millisecond execution latency across all simulation modules.

---

## 📄 License & Academic Attribution
Developed as an academic capstone project for **3rd-Year B.Tech Computer Science & Engineering**.
