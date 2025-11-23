import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Mindfulness = lazy(() => import('./pages/Mindfulness'));
const Studies = lazy(() => import('./pages/Studies'));
const DailyInfo = lazy(() => import('./pages/DailyInfo'));
const Profile = lazy(() => import('./pages/Profile'));
const LibertaMente = lazy(() => import('./pages/LibertaMente'));
const Community = lazy(() => import('./pages/Community'));
const Meta360 = lazy(() => import('./pages/Meta360'));
const Engagement = lazy(() => import('./pages/Engagement'));
const PrivateChat = lazy(() => import('./pages/PrivateChat'));
const SafetyCenter = lazy(() => import('./pages/SafetyCenter'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AiTherapist = lazy(() => import('./pages/AiTherapist'));
const HeroJourney = lazy(() => import('./pages/HeroJourney'));
const GuardianDashboard = lazy(() => import('./components/safety/GuardianDashboard'));
const EmergencyContactsConfig = lazy(() => import('./components/safety/EmergencyContactsConfig'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-purple mx-auto mb-4"></div>
      <p className="text-white text-lg">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="mindfulness" element={<Mindfulness />} />
              <Route path="studies" element={<Studies />} />
              <Route path="social" element={<Community />} />

              {/* Protected Routes */}
              <Route path="daily-info" element={
                <ProtectedRoute>
                  <DailyInfo />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="libertamente" element={
                <ProtectedRoute>
                  <LibertaMente />
                </ProtectedRoute>
              } />
              <Route path="meta360" element={
                <ProtectedRoute>
                  <Meta360 />
                </ProtectedRoute>
              } />
              <Route path="engagement" element={
                <ProtectedRoute>
                  <Engagement />
                </ProtectedRoute>
              } />
              <Route path="chat" element={
                <ProtectedRoute>
                  <PrivateChat />
                </ProtectedRoute>
              } />
              <Route path="safety" element={
                <ProtectedRoute>
                  <SafetyCenter />
                </ProtectedRoute>
              } />
              <Route path="ai-therapist" element={
                <ProtectedRoute>
                  <AiTherapist />
                </ProtectedRoute>
              } />
              <Route path="hero-journey" element={
                <ProtectedRoute>
                  <HeroJourney />
                </ProtectedRoute>
              } />
              <Route path="guardian" element={
                <ProtectedRoute>
                  <GuardianDashboard />
                </ProtectedRoute>
              } />
              <Route path="emergency-contacts" element={
                <ProtectedRoute>
                  <EmergencyContactsConfig />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
