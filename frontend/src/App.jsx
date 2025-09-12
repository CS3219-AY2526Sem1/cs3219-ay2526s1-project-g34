import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LayoutComponent } from './components/LayoutComponent';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage setUser={setUser} />} />
          <Route element={<LayoutComponent />}>
            <Route path="/home"
              element={
                <ProtectedRoute user={user}>
                  <HomePage />
                </ProtectedRoute>
              } />
          </Route>

        </Routes>
    </BrowserRouter>
  );
}

export default App;
