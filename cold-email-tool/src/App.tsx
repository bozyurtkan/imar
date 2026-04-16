import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scraper from './pages/Scraper';
import Leads from './pages/Leads';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
