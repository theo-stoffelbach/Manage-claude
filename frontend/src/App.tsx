import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PromptsPage from './pages/PromptsPage';
import AccountsPage from './pages/AccountsPage';
import FragmentsPage from './pages/FragmentsPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/fragments" element={<FragmentsPage />} />
        </Route>

        {/* Redirect root to prompts */}
        <Route path="/" element={<Navigate to="/prompts" replace />} />

        {/* Catch all - redirect to prompts */}
        <Route path="*" element={<Navigate to="/prompts" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
