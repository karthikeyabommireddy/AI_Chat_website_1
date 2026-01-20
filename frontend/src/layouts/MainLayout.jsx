import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-secondary-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
