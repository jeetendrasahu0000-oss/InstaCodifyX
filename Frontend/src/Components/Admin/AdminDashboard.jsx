// AdminDashboard.jsx
// Layout wrapper: Navbar + Sidebar always visible, child pages in <Outlet />

import { useAdmin } from "../../Components/Admin/AdminContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styles from "./AdminDashboard.module.css";

import {
  MdDashboard,
  MdOutlineAssignment,
  MdPeopleOutline,
  MdVerifiedUser,
  MdPersonAdd,
  MdTableChart,
  MdInterpreterMode,
  MdLogout,
  MdMenu,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdTerminal,
  MdTrendingUp,
} from "react-icons/md";

/* ─── Animated Counter ───────────────────────────────────────────────── */
function Counter({ to, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <span>{val.toLocaleString()}</span>;
}

/* ─── Nav Config ──────────────────────────────────────────────────────── */
const ALL_NAV_ITEMS = [
  {
    key: "problems",
    route: "/admin/problems",
    roles: ["admin", "setter"],
    icon: MdOutlineAssignment,
    label: "Problems",
    accent: "#2563eb",
    desc: "Add, edit, delete competitive programming problems",
  },
  {
    key: "setters",
    route: "/admin/users",
    roles: ["admin"],
    icon: MdPeopleOutline,
    label: "Manage Setters",
    accent: "#7c3aed",
    desc: "Add or remove problem setters from the platform",
  },
  {
    key: "requests",
    route: "/admin/setter-requests",
    roles: ["admin"],
    icon: MdVerifiedUser,
    label: "Setter Requests",
    accent: "#059669",
    desc: "Review & approve problem setter applications",
  },
  {
    key: "create",
    route: "/admin/register",
    roles: ["admin"],
    icon: MdPersonAdd,
    label: "Create Account",
    accent: "#ea580c",
    desc: "Add new admin or problem setter to the system",
  },
  {
    key: "machine",
    route: "/admin/machine",
    roles: ["admin", "setter"],
    icon: MdTableChart,
    label: "Machine Text",
    accent: "#db2777",
    desc: "Manage machine text and automated content",
  },
  {
    key: "hr",
    route: "/admin/hr-interview",
    roles: ["admin", "setter"],
    icon: MdInterpreterMode,
    label: "HR Interview",
    accent: "#0891b2",
    desc: "Manage HR interview questions and candidate sessions",
  },
];

const STATS = [
  {
    num: 347,
    label: "Total Problems",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: MdOutlineAssignment,
  },
  {
    num: 12,
    label: "Active Setters",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: MdPeopleOutline,
  },
  {
    num: 4,
    label: "Pending Requests",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: MdVerifiedUser,
  },
  {
    num: 18920,
    label: "Registered Users",
    color: "#059669",
    bg: "#f0fdf4",
    icon: MdTrendingUp,
  },
];

/* ─── Dashboard Home (shown at /admin index) ─────────────────────────── */
function DashboardHome({ admin, navItems }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  return (
    <div className={styles.dashHome}>
      {/* Welcome bar */}
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Welcome back,{" "}
            <span className={styles.welcomeName}>
              {admin?.username ?? "Admin"}
            </span>{" "}

          </h1>
          <p className={styles.welcomeSub}>
            Here's what's happening on your platform today.
          </p>
        </div>
      </div>

      {/* Stats */}
      {mounted && (
        <div className={styles.statsRow}>
          {STATS.map((s, i) => {
            const IconComp = s.icon;
            return (
              <div
                key={i}
                className={styles.stat}
                style={{
                  "--stat-color": s.color,
                  "--stat-bg": s.bg,
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <div
                  className={styles.statIconWrap}
                  style={{ background: s.bg }}
                >
                  <IconComp size={20} color={s.color} />
                </div>
                <div>
                  <div className={styles.statNum}>
                    <Counter to={s.num} />
                  </div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section */}
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionLabel}>Quick Access</div>
          <div className={styles.sectionTitle}>Control Panel</div>
          <p className={styles.sectionSubtitle}>
            Manage all platform features from one place
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.cardGrid}>
        {navItems.map((card, i) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.key}
              className={`${styles.card} cxcard`}
              style={{
                animationDelay: `${i * 80 + 200}ms`,
                "--accent": card.accent,
              }}
              onClick={() => navigate(card.route)}
            >
              <div
                className={styles.cardIcon}
                style={{
                  background: `${card.accent}14`,
                  border: `1.5px solid ${card.accent}22`,
                  color: card.accent,
                }}
              >
                <IconComp size={22} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{card.label}</div>
                <div className={styles.cardDesc}>{card.desc}</div>
              </div>
              <div className={styles.cardArrow} style={{ color: card.accent }}>
                <MdChevronRight size={22} />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerPrompt}>
        <MdTerminal size={13} />
        <span>
          CodifyX Admin Console — Logged in as{" "}
          <strong>{admin?.username}</strong>
        </span>
      </div>
    </div>
  );
}

/* ─── Page Header (shown inside nested routes) ───────────────────────── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className={styles.pageHeaderBar}>
      <div>
        <h2 className={styles.pageHeaderTitle}>{title}</h2>
        {subtitle && <p className={styles.pageHeaderSub}>{subtitle}</p>}
      </div>
      {children && <div className={styles.pageHeaderActions}>{children}</div>}
    </div>
  );
}

/* ─── Main Layout Component ──────────────────────────────────────────── */
export default function AdminDashboard() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    isMobile.current = mq.matches;
    const handler = (e) => {
      isMobile.current = e.matches;
      if (e.matches) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      .cxcard { animation: fadeUp 0.36s ease both; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const visibleNav = ALL_NAV_ITEMS.filter((n) => n.roles.includes(admin?.role));
  const isHome =
    location.pathname === "/admin" || location.pathname === "/admin/";
  const isActive = (route) => location.pathname.startsWith(route);
  const handleCollapse = () => {
    if (!isMobile.current) setCollapsed((v) => !v);
  };

  return (
    <div className={styles.root}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>

        <div className={styles.logoWrap}>
          <div className={styles.logoDot} />
          <span className={styles.logoText}>
            Codify<span className={styles.logoAccent}>X</span>
            <span className={styles.logoPath}> /admin</span>
          </span>
        </div>

        <div className={styles.navVersion}>
          <MdTerminal size={14} />
          <span>v2.1.0</span>
        </div>

        <div className={styles.navRight}>
          <div className={styles.userChip}>
            <span className={styles.userName}>
              {admin?.username ?? "admin"}
            </span>
            <span className={styles.dot}>·</span>
            <span
              className={
                admin?.role === "admin" ? styles.roleAdmin : styles.roleSetter
              }
            >
              {admin?.role ?? "role"}
            </span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          >
            <MdLogout size={16} />
            <span className={styles.logoutLabel}>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className={styles.body}>
        {mobileOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={[
            styles.sidebar,
            collapsed ? styles.sidebarCollapsed : "",
            mobileOpen ? styles.sidebarMobileOpen : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.sidebarHeader}>
            <div
              className={styles.sidebarBrand}
              onClick={() => navigate("/admin")}
              title="Dashboard"
            >
              <MdDashboard
                size={collapsed ? 22 : 18}
                color="#2563eb"
                style={{ flexShrink: 0 }}
              />
              {!collapsed && <span>Admin Dashboard</span>}
            </div>
            <button className={styles.collapseBtn} onClick={handleCollapse}>
              {collapsed ? (
                <MdChevronRight size={18} />
              ) : (
                <MdChevronLeft size={18} />
              )}
            </button>
          </div>

          <div className={styles.sidebarDivider} />

          <nav className={styles.sidebarNav}>
            {visibleNav.map((item) => {
              const IconComp = item.icon;
              const active = isActive(item.route);
              return (
                <button
                  key={item.key}
                  className={[
                    styles.navItem,
                    active ? styles.navItemActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ "--item-accent": item.accent }}
                  onClick={() => navigate(item.route)}
                  title={collapsed ? item.label : ""}
                >
                  <span
                    className={styles.navIcon}
                    style={{ color: active ? item.accent : undefined }}
                  >
                    <IconComp size={18} />
                  </span>
                  {!collapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <span
                      className={styles.navActiveDot}
                      style={{ background: item.accent }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {!collapsed && (
            <div className={styles.sidebarFooter}>
              <span className={styles.sidebarFooterText}>CodifyX © 2026</span>
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className={styles.main}>
          {isHome ? (
            <DashboardHome admin={admin} navItems={visibleNav} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
