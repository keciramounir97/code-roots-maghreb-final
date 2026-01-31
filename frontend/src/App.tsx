import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, memo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// ===== EAGERLY LOADED (Critical Path) =====
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ===== LAZY LOADED PUBLIC PAGES =====
const Home = lazy(() => import("./pages/home"));
const GalleryPage = lazy(() => import("./pages/Gallery"));
const Periods = lazy(() => import("./pages/periods"));
const SourcesAndArchives = lazy(() => import("./pages/SourcesAndArchives"));
const ContactUs = lazy(() => import("./pages/contactUs"));

// ===== LAZY LOADED AUTH PAGES =====
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const ResetPassword = lazy(() => import("./pages/resetpassword"));

// ===== LAZY LOADED ERROR PAGE =====
const ErrorPage = lazy(() => import("./pages/error"));

// ===== LAZY LOADED ADMIN (Separate Bundle) =====
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./admin/components/protectedRoute"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Trees = lazy(() => import("./admin/pages/Trees"));
const AdminGallery = lazy(() => import("./admin/pages/Gallery"));
const AdminBooks = lazy(() => import("./admin/pages/Books"));
const UsersPage = lazy(() => import("./admin/pages/Users"));
const Settings = lazy(() => import("./admin/pages/Settings"));
const ActivityLog = lazy(() => import("./admin/pages/ActivityLog"));

/**
 * Loading Fallback Component
 * Memoized to prevent re-renders
 */
const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-beige dark:bg-[#1a0f0a]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-primary-brown/20 dark:border-accent-gold/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-accent-gold rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-transparent border-b-primary-brown/40 dark:border-b-accent-gold/40 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="text-primary-brown dark:text-accent-gold font-cinzel text-lg tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
});

/**
 * Admin Loading Fallback (smaller, for nested routes)
 */
const AdminLoadingFallback = memo(function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-3 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
});

/**
 * Main App Component
 */
function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
      offset: 50,
    });
  }, []);

  return (
    <>
      {/* Hide Navbar in Admin */}
      {!isAdminRoute && <Navbar />}

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/library" element={<GalleryPage />} />
          <Route path="/periods" element={<Periods />} />
          {/* Unified Sources & Archives page */}
          <Route path="/archives" element={<SourcesAndArchives />} />
          <Route path="/sources" element={<SourcesAndArchives />} />
          <Route path="/access-reliability" element={<SourcesAndArchives />} />
          <Route path="/sourcesandarchives" element={<SourcesAndArchives />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* ===== AUTH ROUTES ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

          {/* ===== ADMIN ROUTES (PROTECTED + LAZY) ===== */}
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="trees"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Trees />
                </Suspense>
              }
            />
            <Route
              path="gallery"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminGallery />
                </Suspense>
              }
            />
            <Route
              path="books"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminBooks />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <UsersPage />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="activity"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ActivityLog />
                </Suspense>
              }
            />
          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
