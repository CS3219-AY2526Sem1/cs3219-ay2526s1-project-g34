import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LayoutComponent } from './components/LayoutComponent';
import { MatchRoom } from './pages/MatchRoom';
import { CreateMatchPage } from './pages/CreateMatchPage';
import { MatchesPage } from './pages/MatchesPage';
import { SignupPage } from './pages/SignupPage';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      return null;
    }
  });

  // persist to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    window.location.href = '/';
}

  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          <Route element={<LayoutComponent handleLogout={handleLogout} />}>
            <Route path="/home"
              element={
                <ProtectedRoute user={user}>
                  <HomePage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/match/:matchId"
                element={
                  <ProtectedRoute user={user}>
                    <MatchRoom user={user} />
                  </ProtectedRoute>
                }
                />
              <Route path="/create_match"
                element={
                  <ProtectedRoute user={user}>
                    <CreateMatchPage user={user} />
                  </ProtectedRoute>
                }
                />
              <Route path="/matches"
                element={
                  <ProtectedRoute user={user}>
                    <MatchesPage />
                  </ProtectedRoute>
                }
                />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
