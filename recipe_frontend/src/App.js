import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import SearchPage from './pages/SearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import SavedPage from './pages/SavedPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// PUBLIC_INTERFACE
function App() {
  /** Root app: provides routing and global auth context */
  return (
    <div className="app-shell">
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <main className="container">
            <Routes>
              <Route index element={<SearchPage />} />
              <Route path="/recipe/:id" element={<RecipeDetailPage />} />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<SearchPage />} />
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
