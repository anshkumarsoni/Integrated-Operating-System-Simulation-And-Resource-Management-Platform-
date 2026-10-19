import React, { createContext, useState, useEffect, useCallback } from 'react';
import { osService } from '../services/osService.js';

export const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [processes, setProcesses] = useState([]);
  const [memoryStatus, setMemoryStatus] = useState(null);
  const [resources, setResources] = useState([]);
  const [threads, setThreads] = useState([]);
  const [ioRequests, setIoRequests] = useState([]);
  const [systemCalls, setSystemCalls] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [simSpeed, setSimSpeed] = useState(1000);

  const refreshAll = useCallback(() => {
    setProcesses(osService.getProcesses());
    setMemoryStatus(osService.getMemoryStatus());
    setResources(osService.getResources());
    setThreads(osService.getThreads());
    setIoRequests(osService.getIORequests());
    setSystemCalls(osService.getSystemCalls());
    setExecutionHistory(osService.getExecutionHistory());
    setDashboardStats(osService.getDashboardStats());
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Wrapped actions that immediately trigger state refresh
  const createProcess = async (data) => {
    const res = osService.createProcess(data);
    refreshAll();
    return res;
  };

  const updateProcessState = async (pid, state) => {
    const res = osService.updateProcessState(pid, state);
    refreshAll();
    return res;
  };

  const terminateProcess = async (pid) => {
    const res = osService.terminateProcess(pid);
    refreshAll();
    return res;
  };

  const allocateMemory = async (pid, size, algorithm) => {
    const res = osService.allocateMemory(pid, size, algorithm);
    refreshAll();
    return res;
  };

  const deallocateMemory = async (pid) => {
    const res = osService.deallocateMemory(pid);
    refreshAll();
    return res;
  };

  const createIORequest = async (pid, device, requestType) => {
    const res = osService.createIORequest(pid, device, requestType);
    refreshAll();
    return res;
  };

  const completeIORequest = async (requestId) => {
    const res = osService.completeIORequest(requestId);
    refreshAll();
    return res;
  };

  const requestResource = async (pid, resourceId, quantity) => {
    const res = osService.requestResource(pid, resourceId, quantity);
    refreshAll();
    return res;
  };

  const releaseResource = async (pid, resourceId, quantity) => {
    const res = osService.releaseResource(pid, resourceId, quantity);
    refreshAll();
    return res;
  };

  const resetAll = async () => {
    const res = osService.resetAll();
    refreshAll();
    return res;
  };

  return (
    <SimulationContext.Provider value={{
      processes,
      memoryStatus,
      resources,
      threads,
      ioRequests,
      systemCalls,
      executionHistory,
      dashboardStats,
      simSpeed,
      setSimSpeed,
      refreshAll,
      createProcess,
      updateProcessState,
      terminateProcess,
      allocateMemory,
      deallocateMemory,
      createIORequest,
      completeIORequest,
      requestResource,
      releaseResource,
      resetAll,
      osService
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
