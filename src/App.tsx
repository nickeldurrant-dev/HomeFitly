import { useEffect } from 'react';
import LandingPage from './components/LandingPage';

// HomeFitly marketing site. The product is the native iOS app;
// this site is a landing page only. Legacy web app routes
// (/login, /signup, /dashboard) redirect to the homepage.
function App() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/signup' || path === '/dashboard') {
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  return <LandingPage />;
}

export default App;
