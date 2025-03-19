import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import ForYou from './pages/ForYou';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/" replace />
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }>
          <Route index element={<Home />} />
          <Route path="for-you" element={<ForYou />} />
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;