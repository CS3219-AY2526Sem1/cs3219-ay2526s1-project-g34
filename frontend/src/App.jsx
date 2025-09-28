import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LayoutComponent } from './components/LayoutComponent';
import { CollaborationPage } from './pages/CollaborationPage';
import { CreateMatchPage } from './pages/CreateMatchPage';

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

  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage setUser={setUser} />} />
          <Route element={<LayoutComponent />}>
            <Route path="/home"
              element={
                <ProtectedRoute user={user}>
                  <HomePage user={user} />
                </ProtectedRoute>
              } />
              <Route path="/collaborate"
                element={
                  <ProtectedRoute user={user}>
                    <CollaborationPage />
                  </ProtectedRoute>
                }
                />
              <Route path="/create_match"
                element={
                  <ProtectedRoute user={user}>
                    <CreateMatchPage />
                  </ProtectedRoute>
                }
                />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
