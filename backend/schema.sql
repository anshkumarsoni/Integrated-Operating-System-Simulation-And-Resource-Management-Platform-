-- OS Simulation Platform - Relational Database Schema
-- Target: MySQL 8.0 / 8.4+

CREATE DATABASE IF NOT EXISTS os_simulation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE os_simulation_db;

-- 1. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Student',
  email VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Processes Table
CREATE TABLE IF NOT EXISTS processes (
  pid VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state ENUM('NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED') NOT NULL DEFAULT 'READY',
  arrival_time INT DEFAULT 0,
  burst_time INT NOT NULL,
  priority INT NOT NULL DEFAULT 5,
  memory_required INT DEFAULT 64,
  cpu_time_used INT DEFAULT 0,
  io_required BOOLEAN DEFAULT FALSE,
  resource_required VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB;

-- 3. Process Control Block (PCB) Internals
CREATE TABLE IF NOT EXISTS pcb (
  pid VARCHAR(20) PRIMARY KEY,
  process_name VARCHAR(100) NOT NULL,
  state VARCHAR(20) NOT NULL,
  program_counter VARCHAR(20) DEFAULT '0x00401000',
  cpu_registers JSON,
  memory_allocation JSON,
  thread_count INT DEFAULT 1,
  creation_time BIGINT,
  FOREIGN KEY (pid) REFERENCES processes(pid) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Physical Memory Partitions
CREATE TABLE IF NOT EXISTS memory_allocations (
  block_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  size_mb INT NOT NULL,
  start_address INT NOT NULL,
  status ENUM('Allocated', 'Free') NOT NULL DEFAULT 'Free',
  pid VARCHAR(20) DEFAULT NULL,
  internal_frag INT DEFAULT 0
) ENGINE=InnoDB;

-- 5. System Resources (Multi-instance R1 - R4)
CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_instances INT NOT NULL,
  available_instances INT NOT NULL,
  allocated_instances INT DEFAULT 0
) ENGINE=InnoDB;

-- 6. POSIX System Calls Audit Log
CREATE TABLE IF NOT EXISTS system_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  call_id VARCHAR(30) NOT NULL,
  pid VARCHAR(20),
  call_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

-- 7. Hierarchical File System Nodes (Inodes)
CREATE TABLE IF NOT EXISTS filesystem_nodes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id VARCHAR(50) DEFAULT NULL,
  type ENUM('file', 'directory') NOT NULL,
  size_bytes INT DEFAULT 0,
  permissions VARCHAR(10) DEFAULT 'rwxr-xr-x'
) ENGINE=InnoDB;

-- 8. Execution Threads
CREATE TABLE IF NOT EXISTS threads (
  thread_id VARCHAR(30) PRIMARY KEY,
  pid VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(20) DEFAULT 'READY'
) ENGINE=InnoDB;

-- 9. Secondary Storage I/O Requests
CREATE TABLE IF NOT EXISTS io_requests (
  request_id VARCHAR(30) PRIMARY KEY,
  pid VARCHAR(20),
  device VARCHAR(50) NOT NULL,
  request_type VARCHAR(20) NOT NULL,
  cylinder INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pending'
) ENGINE=InnoDB;

-- 10. Execution History / Kernel Timeline
CREATE TABLE IF NOT EXISTS execution_history (
  id VARCHAR(30) PRIMARY KEY,
  timestamp VARCHAR(30) NOT NULL,
  pid VARCHAR(20),
  event VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

-- SEED INITIAL DATA
INSERT IGNORE INTO users (id, username, password, name, role, email) VALUES
(1, 'admin', 'admin123', 'System Administrator', 'Administrator', 'admin@os-sim.edu'),
(2, 'student', 'student123', 'CS Student Demo', 'Student', 'student@os-sim.edu');

INSERT IGNORE INTO processes (pid, name, state, arrival_time, burst_time, priority, memory_required, cpu_time_used, io_required, resource_required) VALUES
('P101', 'Web Server Daemon', 'RUNNING', 0, 8, 1, 128, 4, FALSE, 'R1'),
('P102', 'Database Query Engine', 'READY', 1, 12, 2, 256, 0, TRUE, 'R2'),
('P103', 'Compiler Pipeline', 'READY', 2, 6, 3, 192, 0, FALSE, NULL),
('P104', 'Background Audio Worker', 'WAITING', 3, 4, 4, 64, 2, TRUE, 'R3'),
('P105', 'System Monitoring Agent', 'READY', 4, 5, 2, 80, 0, FALSE, NULL);

INSERT IGNORE INTO pcb (pid, process_name, state, program_counter, cpu_registers, memory_allocation, thread_count, creation_time) VALUES
('P101', 'Web Server Daemon', 'RUNNING', '0x004012A0', '{"EAX":"0x00000008","EBX":"0x00402000","ECX":"0x00000004","EDX":"0x00000001"}', '{"base":0,"limit":128,"block":"Block 1"}', 2, 1727000000000),
('P102', 'Database Query Engine', 'READY', '0x004035C0', '{"EAX":"0x0000000C","EBX":"0x00404000","ECX":"0x00000000","EDX":"0x00000000"}', '{"base":128,"limit":256,"block":"Block 2"}', 3, 1727000010000),
('P103', 'Compiler Pipeline', 'READY', '0x00405100', '{"EAX":"0x00000006","EBX":"0x00406000","ECX":"0x00000000","EDX":"0x00000000"}', '{"base":384,"limit":192,"block":"Block 3"}', 1, 1727000020000),
('P104', 'Background Audio Worker', 'WAITING', '0x00407840', '{"EAX":"0x00000004","EBX":"0x00408000","ECX":"0x00000002","EDX":"0x00000003"}', '{"base":576,"limit":64,"block":"Block 4"}', 1, 1727000030000),
('P105', 'System Monitoring Agent', 'READY', '0x00409A20', '{"EAX":"0x00000005","EBX":"0x0040A000","ECX":"0x00000000","EDX":"0x00000000"}', '{"base":640,"limit":80,"block":"Block 5"}', 1, 1727000040000);

INSERT IGNORE INTO memory_allocations (block_id, name, size_mb, start_address, status, pid, internal_frag) VALUES
(1, 'System Partition Alpha', 150, 0, 'Allocated', 'P101', 22),
(2, 'High-Mem Workload Beta', 300, 150, 'Allocated', 'P102', 44),
(3, 'Execution Buffer Gamma', 200, 450, 'Allocated', 'P103', 8),
(4, 'Dynamic Partition Delta', 100, 650, 'Allocated', 'P104', 36),
(5, 'Kernel Pool Epsilon', 274, 750, 'Allocated', 'P105', 194);

INSERT IGNORE INTO resources (id, name, total_instances, available_instances, allocated_instances) VALUES
('R1', 'CPU Accelerator Core', 4, 3, 1),
('R2', 'NVMe Storage Channel', 3, 2, 1),
('R3', 'Network Interface Card', 2, 1, 1),
('R4', 'Hardware Mutex Lock', 5, 5, 0);

INSERT IGNORE INTO system_calls (call_id, pid, call_name, status, description) VALUES
('SYS-101', 'P101', 'sys_fork', 'SUCCESS', 'Spawned worker thread child process context'),
('SYS-102', 'P102', 'sys_read', 'SUCCESS', 'Buffered 4096 bytes from NVMe drive block #204'),
('SYS-103', 'P104', 'sys_sem_wait', 'SUCCESS', 'Acquired semaphore lock for audio stream buffer'),
('SYS-104', 'P103', 'sys_brk', 'SUCCESS', 'Allocated heap memory segment +128MB');

INSERT IGNORE INTO filesystem_nodes (id, name, parent_id, type, size_bytes, permissions) VALUES
('root', 'root', NULL, 'directory', 4096, 'rwxr-xr-x'),
('bin', 'bin', 'root', 'directory', 4096, 'rwxr-xr-x'),
('etc', 'etc', 'root', 'directory', 4096, 'rwxr-xr-x'),
('home', 'home', 'root', 'directory', 4096, 'rwxr-xr-x'),
('kernel_conf', 'kernel.conf', 'etc', 'file', 1024, 'rw-r--r--'),
('os_scheduler', 'scheduler.bin', 'bin', 'file', 65536, 'rwxr-xr-x');

INSERT IGNORE INTO threads (thread_id, pid, name, state) VALUES
('T-P101-1', 'P101', 'HTTP Request Listener', 'RUNNING'),
('T-P101-2', 'P101', 'SSL Decryption Worker', 'READY'),
('T-P102-1', 'P102', 'B-Tree Index Scanner', 'READY'),
('T-P104-1', 'P104', 'Audio Buffer Feeder', 'WAITING');

INSERT IGNORE INTO io_requests (request_id, pid, device, request_type, cylinder, status) VALUES
('IO-001', 'P102', 'NVMe Disk 0', 'READ', 145, 'Completed'),
('IO-002', 'P104', 'Audio Interface', 'WRITE', 20, 'Processing');

INSERT IGNORE INTO execution_history (id, timestamp, pid, event, module, status) VALUES
('EVT-1001', '10:00:01', 'P101', 'Context Switch to P101', 'CPU Scheduler', 'SUCCESS'),
('EVT-1002', '10:00:03', 'P102', 'Memory Page Allocation (256MB)', 'Memory Manager', 'SUCCESS'),
('EVT-1003', '10:00:06', 'P104', 'Waiting for Resource R3', 'Deadlock Manager', 'BLOCKED');
