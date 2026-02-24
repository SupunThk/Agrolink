import { useContext, useEffect } from "react";
import Topbar from "./components/topbar/Topbar";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Settings from "./pages/settings/Settings";
import Single from "./pages/single/Single";
import Write from "./pages/write/Write";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import AdminPanel from "./pages/admin/AdminPanel";
import AskExpert from "./pages/askExpert/AskExpert";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Context } from "./context/Context";
import VerificationModal from "./components/verificationModal/VerificationModal";
import DeleteModal from "./components/deleteModal/DeleteModal";

function AppContent() {
  const { user, showVModal, showDModal, dispatch, theme } = useContext(Context);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isAdminRoute = location.pathname === "/admin";

  return (
    <>
      {!isAdminRoute && <Topbar />}
      {showVModal && <VerificationModal setShowModal={(val) => dispatch({ type: val ? "SHOW_VMODAL" : "HIDE_VMODAL" })} />}
      {showDModal && <DeleteModal />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={user ? <Home /> : <Register />}
        />
        <Route
          path="/login"
          element={user ? <Home /> : <Login />}
        />
        <Route path="/post/:id" element={<Single />} />
        <Route
          path="/write"
          element={user ? <Write /> : <Login />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Login />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ask-expert" element={<AskExpert />} />
        <Route
          path="/admin"
          element={user && user.isAdmin ? <AdminPanel /> : <Login />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
