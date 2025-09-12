import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { useState, useEffect   } from 'react';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <BrowserRouter>
      <div>
        <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
          <Route path="/home"
            element={
              <ProtectedRoute user={user}>
                <HomePage />
              </ProtectedRoute>
            } />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
