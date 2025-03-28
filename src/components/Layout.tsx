import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="app-container min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>
      <main className="main-content flex-grow overflow-y-auto mt-16 mb-16">
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer />
      </div>
    </div>
  );
}