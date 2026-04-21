import { useContext, useEffect, useCallback } from "react";
import Topbar from "./components/topbar/Topbar";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Settings from "./pages/settings/Settings";
import Single from "./pages/single/Single";
import Write from "./pages/write/Write";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Marketplace from "./pages/marketplace/Marketplace";
import AdminPanel from "./pages/admin/AdminPanel";
import AskExpert from "./pages/askExpert/AskExpert";
import AnswerQuestions from "./pages/answerQuestions/AnswerQuestions";
import MyBlogs from "./pages/myBlogs/MyBlogs";
import Events from "./pages/events/Events";
import DiseaseDetection from "./pages/diseaseDetection/DiseaseDetection";
import KnowledgeBase from "./pages/knowledgeBase/KnowledgeBase";
import DiseaseDetail from "./pages/knowledgeBase/DiseaseDetail";
import AddDisease from "./pages/knowledgeBase/AddDisease";
import MyKnowledgeSubmissions from "./pages/knowledgeBase/MyKnowledgeSubmissions";
import MySubmissionDetail from "./pages/knowledgeBase/MySubmissionDetail";
import EditDiseaseSubmission from "./pages/knowledgeBase/EditDiseaseSubmission";
import AdminPendingReview from "./pages/knowledgeBase/AdminPendingReview";
import AdminDiseaseCreate from "./pages/knowledgeBase/AdminDiseaseCreate";
import AdminDiseaseEdit from "./pages/knowledgeBase/AdminDiseaseEdit";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Context } from "./context/Context";
import VerificationModal from "./components/verificationModal/VerificationModal";
import DeleteModal from "./components/deleteModal/DeleteModal";
import axios from "axios";

function AppContent() {
  const { user, showVModal, showDModal, dispatch, theme } = useContext(Context);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Periodically check if the logged-in user's account still exists and is active
  const checkAccountStatus = useCallback(async () => {
    if (!user || !user._id) return;
    try {
      const res = await axios.get("/users/check/status/" + user._id);
      if (!res.data.exists) {
        // Account was deleted — force sign out
        dispatch({ type: "LOGOUT" });
        sessionStorage.removeItem("user");
        window.location.replace("/login");
      } else if (!res.data.active) {
        // Account was deactivated — force sign out with message
        dispatch({ type: "LOGOUT" });
        sessionStorage.removeItem("user");
        sessionStorage.setItem(
          "deactivatedMessage",
          "Your account has been deactivated by an administrator. Please contact support.",
        );
        window.location.replace("/login");
      }
    } catch (err) {
      // If 404, account no longer exists
      if (err.response && err.response.status === 404) {
        dispatch({ type: "LOGOUT" });
        sessionStorage.removeItem("user");
        window.location.replace("/login");
      }
    }
  }, [user, dispatch]);

  // Check on mount and every 30 seconds
  useEffect(() => {
    if (!user) return;
    checkAccountStatus();
    const interval = setInterval(checkAccountStatus, 30000);
    return () => clearInterval(interval);
  }, [user, checkAccountStatus]);

  // Also check on route change
  useEffect(() => {
    if (user) checkAccountStatus();
  }, [location.pathname, user, checkAccountStatus]);

  const isAdminRoute = location.pathname === "/admin";

  return (
    <>
      {!isAdminRoute && <Topbar adminMode={user && user.isAdmin} />}
      {showVModal && (
        <VerificationModal
          setShowModal={(val) =>
            dispatch({ type: val ? "SHOW_VMODAL" : "HIDE_VMODAL" })
          }
        />
      )}
      {showDModal && <DeleteModal />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={user ? <Home /> : <Register />} />
        <Route path="/login" element={user ? <Home /> : <Login />} />
        <Route path="/post/:id" element={<Single />} />
        <Route path="/write" element={user ? <Write /> : <Login />} />
        <Route path="/settings" element={user ? <Settings /> : <Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/ask-expert" element={<AskExpert />} />
        <Route
          path="/answer-questions"
          element={
            user && (user.role === "expert" || user.isAdmin) ? (
              <AnswerQuestions />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/my-blogs" element={user ? <MyBlogs /> : <Login />} />
        <Route
          path="/admin"
          element={user && user.isAdmin ? <AdminPanel /> : <Login />}
        />
        <Route path="/events" element={user ? <Events /> : <Login />} />
        <Route
          path="/disease-detection"
          element={user ? <DiseaseDetection /> : <Login />}
        />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/disease-detail/:id" element={<DiseaseDetail />} />
        <Route path="/add-disease" element={user ? <AddDisease /> : <Login />} />
        <Route
          path="/my-knowledge-submissions"
          element={user ? <MyKnowledgeSubmissions /> : <Login />}
        />
        <Route
          path="/my-knowledge-submissions/:id"
          element={user ? <MySubmissionDetail /> : <Login />}
        />
        <Route
          path="/my-knowledge-submissions/:id/edit"
          element={user ? <EditDiseaseSubmission /> : <Login />}
        />
        <Route
          path="/knowledge-review"
          element={user && user.isAdmin ? <AdminPendingReview /> : <Login />}
        />
        <Route
          path="/knowledge/admin/new"
          element={user && user.isAdmin ? <AdminDiseaseCreate /> : <Login />}
        />
        <Route
          path="/knowledge/admin/:id/edit"
          element={user && user.isAdmin ? <AdminDiseaseEdit /> : <Login />}
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
