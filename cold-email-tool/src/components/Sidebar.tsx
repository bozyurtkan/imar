import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Users,
  Mail,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scraper', icon: Search, label: 'Lead Scraper' },
  { to: '/leads', icon: Users, label: 'Leadler' },
  { to: '/campaigns', icon: Mail, label: 'Kampanyalar' },
  { to: '/analytics', icon: BarChart3, label: 'Analitik' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Cold Email Tool</h1>
        <span>imarmevzuat.com.tr</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        v1.0.0 — Lokal Araç
      </div>
    </aside>
  );
}
