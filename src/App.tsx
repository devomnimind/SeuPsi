import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Mindfulness } from './pages/Mindfulness';
import { Studies } from './pages/Studies';
import { DailyInfo } from './pages/DailyInfo';
import { Profile } from './pages/Profile';
import { LibertaMente } from './pages/LibertaMente';
import { Community } from './pages/Community';
import { Meta360 } from './pages/Meta360';
import { Engagement } from './pages/Engagement';
import { PrivateChat } from './pages/PrivateChat';
import { SafetyCenter } from './pages/SafetyCenter';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="mindfulness" element={<Mindfulness />} />
            <Route path="studies" element={<Studies />} />
            <Route path="community" element={<Community />} />

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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
