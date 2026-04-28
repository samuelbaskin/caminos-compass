import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import TeacherDashboard from "./TeacherDashboard";
import CoachDashboard from "./CoachDashboard";
import AdminDashboard from "./AdminDashboard";
import EducationalChatbot from "./components/EducationalChatbot";
import { getStoredUser, logout } from "./api/auth";

function App() {
  const [user, setUser] = useState(() => getStoredUser());

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (user) {
    if (user.role === "teacher") {
      return (
        <>
          <TeacherDashboard user={user} onLogout={handleLogout} />
          <EducationalChatbot />
        </>
      );
    }
    if (user.role === "coach") {
      return (
        <>
          <CoachDashboard user={user} onLogout={handleLogout} />
          <EducationalChatbot />
        </>
      );
    }
    if (user.role === "admin") {
      return (
        <>
          <AdminDashboard user={user} onLogout={handleLogout} />
          <EducationalChatbot />
        </>
      );
    }

    logout();
    setUser(null);
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
