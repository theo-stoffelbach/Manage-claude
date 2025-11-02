import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<div className="p-8"><h1 className="text-3xl font-bold">Claude Prompt Manager</h1></div>} />
          <Route path="/login" element={<div className="p-8"><h1 className="text-2xl">Login</h1></div>} />
          <Route path="/register" element={<div className="p-8"><h1 className="text-2xl">Register</h1></div>} />
          <Route path="/accounts" element={<div className="p-8"><h1 className="text-2xl">Accounts</h1></div>} />
          <Route path="/prompts" element={<div className="p-8"><h1 className="text-2xl">Prompts</h1></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
