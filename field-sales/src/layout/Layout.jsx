import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
export default function Layout() {


  return (
    <div className="flex h-screen bg-[#f4f7f9] font-sans">
      
      {/* Sidebar - Deep Blue */}
      <Sidebar />


      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f7f9] p-8">
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
}