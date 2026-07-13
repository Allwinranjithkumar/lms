import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation } from "react-router-dom";

import SplashScreen from "./Components/SplashScreen";
import LandingPage from "./pages/landing_page";
import Login from "./pages/login";
import Register from "./pages/Register";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";


import Dashboard from "./pages/teacher/Dashboard";
import MyCourses from "./pages/teacher/MyCourses";
import CreateCourse from "./pages/teacher/CreateCourse";
import LiveClasses from "./pages/teacher/LiveClasses";
import Assignments from "./pages/teacher/Assignments";
import Students from "./pages/teacher/Students";
import Analytics from "./pages/teacher/Analytics";
import Resources from "./pages/teacher/Resources";
import Messages from "./pages/teacher/Messages";
import Notifications from "./pages/teacher/Notifications";
import Settings from "./pages/teacher/Settings";

import StudentDashboard from "./pages/student/Dashboard";
import MyCoursesStudent from "./pages/student/MyCourses";
import BrowseCoursesStudent from "./pages/student/BrowseCourses";
import LiveClassesStudent from "./pages/student/LiveClasses";
import AssignmentsStudent from "./pages/student/Assignments";
import Grades from "./pages/student/Grades";
import StudentCertificates from "./pages/student/Certificates";
import ResourcesStudent from "./pages/student/Resources";
import MessagesStudent from "./pages/student/Messages";
import NotificationsStudent from "./pages/student/Notifications";
import StudentSettings from "./pages/student/Settings";
import TeacherCertificates from "./pages/teacher/Certificates";
import { isAuthorizedForRole } from "./services/api";

const SPLASH_STORAGE_KEY = "jawa-edtech-splash-seen";

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");
  } catch {
    // Ignore storage errors so private browsing modes still load normally.
  }
}

function shouldShowInitialSplash(pathname) {
  if (pathname !== "/") {
    return false;
  }

  try {
    return sessionStorage.getItem(SPLASH_STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

function RequireRole({ role }) {
  const location = useLocation();
  if (!isAuthorizedForRole(role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const location = useLocation();
  const [initialPathname] = useState(location.pathname);
  const [showSplash, setShowSplash] = useState(() =>
    shouldShowInitialSplash(location.pathname)
  );
  const [hasPlayedSplash] = useState(showSplash);

  useEffect(() => {
    if (initialPathname !== "/") {
      markSplashSeen();
    }
  }, [initialPathname]);

  const handleSplashFinish = useCallback(() => {
    markSplashSeen();
    setShowSplash(false);
  }, []);

  const appContentClassName = showSplash
    ? "app-content app-content--loading"
    : hasPlayedSplash
      ? "app-content app-content--ready"
      : "app-content";

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className={appContentClassName}>

        <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
        <Route 
        path="/register" 
        element={<Register />} 
        />
      <Route element={<RequireRole role="student" />}>
      <Route path="/student" element={<StudentLayout />}>

  <Route index element={<StudentDashboard />} />

  <Route path="dashboard" element={<StudentDashboard />} />

  <Route path="courses" element={<MyCoursesStudent />} />

  <Route path="courses/browse" element={<BrowseCoursesStudent />} />

  <Route path="live-classes" element={<LiveClassesStudent />} />

  <Route path="assignments" element={<AssignmentsStudent />} />

  <Route path="grades" element={<Grades />} />

  <Route path="certificates" element={<StudentCertificates />} />

  <Route path="resources" element={<ResourcesStudent />} />

  <Route path="messages" element={<MessagesStudent />} />

  <Route path="notifications" element={<NotificationsStudent />} />

  <Route path="settings" element={<StudentSettings />} />


</Route>
      </Route>
        
        <Route element={<RequireRole role="teacher" />}>
        <Route path="/teacher" element={<TeacherLayout />}>

  <Route index element={<Dashboard />} />

  <Route path="dashboard" element={<Dashboard />} />

  <Route path="courses" element={<MyCourses />} />

  <Route path="create-course" element={<CreateCourse />} />

  <Route path="live-classes" element={<LiveClasses />} />

  <Route path="assignments" element={<Assignments />} />

  <Route path="certificates" element={<TeacherCertificates />} />

  <Route path="students" element={<Students />} />

  <Route path="analytics" element={<Analytics />} />

  <Route path="resources" element={<Resources />} />

  <Route path="messages" element={<Messages />} />

  <Route path="notifications" element={<Notifications />} />

  <Route path="settings" element={<Settings />} />
  
</Route>
        </Route>

        </Routes>

      </div>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
