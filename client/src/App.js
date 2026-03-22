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
import KnowledgeBase from "./pages/knowledgeBase/KnowledgeBase";
import AddDisease from "./pages/knowledgeBase/AddDisease";
import EditDiseaseSubmission from "./pages/knowledgeBase/EditDiseaseSubmission";
import DiseaseDetail from "./pages/knowledgeBase/DiseaseDetail";
import AdminPendingReview from "./pages/knowledgeBase/AdminPendingReview";
import MyKnowledgeSubmissions from "./pages/knowledgeBase/MyKnowledgeSubmissions";
import MySubmissionDetail from "./pages/knowledgeBase/MySubmissionDetail";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Context } from "./context/Context";
import VerificationModal from "./components/verificationModal/VerificationModal";
import DeleteModal from "./components/deleteModal/DeleteModal";

function App() {
  const { user, showVModal, showDModal, dispatch, theme } = useContext(Context);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Router>
      <Topbar />
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
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/add-disease" element={<AddDisease />} />
        <Route path="/my-knowledge-submissions" element={<MyKnowledgeSubmissions />} />
        <Route path="/my-knowledge-submissions/:id" element={<MySubmissionDetail />} />
        <Route path="/my-knowledge-submissions/:id/edit" element={<EditDiseaseSubmission />} />
        <Route path="/knowledge-review" element={<AdminPendingReview />} />
        <Route path="/disease-detail/:id" element={<DiseaseDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
