import React, { useEffect, useState } from "react";
import {
    FiCreditCard, FiUser, FiMail, FiPackage, FiDollarSign,
    FiCheckCircle, FiXCircle, FiCalendar, FiHash, FiRefreshCw,
    FiSearch, FiInbox, FiTrendingUp, FiShield, FiAlertCircle
} from "react-icons/fi";
import api from "../../utils/api";
import styles from "./PaymentHistory.module.css";

const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className={styles.statCard} style={{ "--accent": accent }}>
        <div className={styles.statIcon}><Icon /></div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    </div>
);

const PaymentHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/payment/all-subscriptions");
            setData(res.data);
        } catch (err) {
            console.error("Error fetching payments:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = Array.isArray(data) ? data.filter((item) => {
        const name = item.userId?.fullname || "";
        const email = item.userId?.email || "";
        const plan = item.planName || "";
        const query = search.toLowerCase();
        const matchSearch = name.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            plan.toLowerCase().includes(query);
        const isExpired = item.endDate && new Date(item.endDate) < new Date();
        if (filter === "active") return matchSearch && !isExpired;
        if (filter === "expired") return matchSearch && isExpired;
        return matchSearch;
    }) : [];

    const totalActive = Array.isArray(data)
        ? data.filter(i => !(i.endDate && new Date(i.endDate) < new Date())).length
        : 0;
    const totalRevenue = Array.isArray(data)
        ? data.reduce((acc, i) => acc + (i.amount || 0), 0)
        : 0;

    return (
        <div className={styles.root}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.iconBadge}>
                        <FiCreditCard />
                    </div>
                    <div>
                        <h1 className={styles.title}>Payment History</h1>
                        <p className={styles.subtitle}>Track all subscription transactions</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    <FiRefreshCw className={loading ? styles.spin : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <StatCard icon={FiTrendingUp} label="Total Transactions" value={data.length} accent="#6366f1" />
                <StatCard icon={FiShield} label="Active Plans" value={totalActive} accent="#10b981" />
                <StatCard icon={FiAlertCircle} label="Expired Plans" value={data.length - totalActive} accent="#f43f5e" />
                <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} accent="#f59e0b" />
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search by name, email or plan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    {["all", "active", "expired"].map(f => (
                        <button
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className={styles.card}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Fetching payment records...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FiInbox className={styles.emptyIcon} />
                        <p>No records found</p>
                        <span>Try adjusting your search or filter</span>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th><span><FiUser /> User</span></th>
                                    <th><span><FiMail /> Email</span></th>
                                    <th><span><FiPackage /> Plan</span></th>
                                    <th><span><FiDollarSign /> Amount</span></th>
                                    <th><span><FiCheckCircle /> Status</span></th>
                                    <th><span><FiCalendar /> Start</span></th>
                                    <th><span><FiCalendar /> End</span></th>
                                    <th><span><FiHash /> Payment ID</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, idx) => {
                                    const isExpired = item.endDate && new Date(item.endDate) < new Date();
                                    return (
                                        <tr key={item._id} style={{ "--delay": `${idx * 30}ms` }}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}>
                                                        {(item.userId?.fullname || "?")[0].toUpperCase()}
                                                    </div>
                                                    <span>{item.userId?.fullname || item.userId || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className={styles.emailCell}>{item.userId?.email || "N/A"}</td>
                                            <td>
                                                <span className={styles.planBadge}>{item.planName || "N/A"}</span>
                                            </td>
                                            <td className={styles.amount}>₹{(item.amount || 0).toLocaleString()}</td>
                                            <td>
                                                <span className={isExpired ? styles.expiredBadge : styles.activeBadge}>
                                                    {isExpired
                                                        ? <><FiXCircle /> Expired</>
                                                        : <><FiCheckCircle /> Active</>
                                                    }
                                                </span>
                                            </td>
                                            <td className={styles.dateCell}>
                                                {item.startDate ? new Date(item.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                            <td className={styles.dateCell}>
                                                {item.endDate ? new Date(item.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                            <td>
                                                <code className={styles.paymentId}>{item.paymentId || "N/A"}</code>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className={styles.footer}>
                Showing {filtered.length} of {data.length} records
            </p>
        </div>
    );
};

export default PaymentHistory;