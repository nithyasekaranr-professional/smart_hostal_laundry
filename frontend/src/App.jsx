import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Admin from './Admin';
import Student from './Student';
import Register from './Register';

export const StateContext = createContext();

export const DEFAULT_ADMIN_PASSWORD = 'admin123';

export default function App() {
  const getInitialPassword = () => {
    const saved = localStorage.getItem('superAdminPassword');
    return saved ? saved.trim() : DEFAULT_ADMIN_PASSWORD;
  };

  const [appState, setAppState] = useState({
    staffStatus: 'Absent',
    superAdminPassword: getInitialPassword(),
    registeredCount: 0,
    currentQrSession: localStorage.getItem('currentQrSession') || 'session-initial',
    dailyLogs: {}
  });
  const [loading, setLoading] = useState(true);

  const updateSuperAdminPassword = (newPassword) => {
    const trimmed = (newPassword || '').trim();
    if (!trimmed) return;
    localStorage.setItem('superAdminPassword', trimmed);
    setAppState(prev => ({ ...prev, superAdminPassword: trimmed }));
  };

  useEffect(() => {
    // Safety timeout: Never block user interface for more than 1.2s if Firebase is slow or blocked
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // 1. Sync System State (Staff Status, QR Session)
    const stateDoc = doc(db, 'system', 'state');
    const unsubState = onSnapshot(stateDoc, (docSnap) => {
      clearTimeout(timeoutId);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activePassword = data.superAdminPassword ? data.superAdminPassword.trim() : getInitialPassword();
        if (data.superAdminPassword) {
          localStorage.setItem('superAdminPassword', data.superAdminPassword.trim());
        }
        if (data.currentQrSession) {
          localStorage.setItem('currentQrSession', data.currentQrSession);
        }
        setAppState(prev => ({
          ...prev,
          staffStatus: data.staffStatus || 'Absent',
          superAdminPassword: activePassword,
          currentQrSession: data.currentQrSession || prev.currentQrSession
        }));
      }
      setLoading(false);
    }, (err) => {
      clearTimeout(timeoutId);
      console.warn("Firebase not configured or no access (falling back to local storage):", err);
      setAppState(prev => ({
        ...prev,
        superAdminPassword: prev.superAdminPassword || getInitialPassword()
      }));
      setLoading(false); // Stop loading even on error so user can continue
    });

    // 2. Sync Registrations for today to get the live count
    const todayStr = new Date().toLocaleDateString('en-CA');
    const logsQuery = query(collection(db, 'registrations'), where('date', '==', todayStr));

    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(d => d.data());
      // Sort by time descending
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);

      setAppState(prev => {
        const newDailyLogs = { ...prev.dailyLogs, [todayStr]: sortedLogs };
        return {
          ...prev,
          registeredCount: sortedLogs.length,
          dailyLogs: newDailyLogs
        };
      });
    }, (err) => {
      console.warn("Could not sync live registrations from Firebase:", err);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubState();
      unsubLogs();
    };
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-center">
          <p>Connecting to Firebase Cloud...</p>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Make sure to update credentials in firebase.js</p>
        </div>
      </div>
    );
  }

  return (
    <StateContext.Provider value={{ appState, setAppState, updateSuperAdminPassword, DEFAULT_ADMIN_PASSWORD }}>
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/student" element={<Student />} />
          <Route path="/student/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </Router>
    </StateContext.Provider>
  );
}
