// ProblemList.jsx — White theme | React Icons | Renders inside AdminDashboard <Outlet />
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllProblemsAPI,
  deleteProblemAPI,
  togglePublishAPI,
} from "./adminApi";
import { useAdmin } from "./AdminContext";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdOutlineAssignment,
  MdVisibility,
  MdVisibilityOff,
  MdClose,
  MdWarning,
} from "react-icons/md";
import styles from "./ProblemList.module.css";

const DIFF_COLOR = { Easy: "#059669", Medium: "#d97706", Hard: "#dc2626" };
const DIFF_BG = { Easy: "#f0fdf4", Medium: "#fffbeb", Hard: "#fef2f2" };

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [deleteId, setDeleteId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const { admin } = useAdmin();
  const navigate = useNavigate();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data } = await getAllProblemsAPI();
      setProblems(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleToggle = async (p) => {
    setActionId(p._id);
    try {
      await togglePublishAPI(p._id);
      await fetchProblems();
    } catch (e) {
      alert("Error updating status");
    }
    setActionId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setActionId(deleteId);
    try {
      await deleteProblemAPI(deleteId);
      setDeleteId(null);
      await fetchProblems();
    } catch (e) {
      alert(e.response?.data?.message || "Error deleting problem");
    }
    setActionId(null);
  };

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || p.difficulty === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className={styles.page}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <MdOutlineAssignment size={13} />
            <span>Problems</span>
          </div>
          <h2 className={styles.pageTitle}>All Problems</h2>
          <p className={styles.pageSub}>
            {problems.length} problem{problems.length !== 1 ? "s" : ""} in the
            bank
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => navigate("/admin/problems/new")}
        >
          <MdAdd size={18} />
          Add Problem
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <MdSearch size={17} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch("")}>
              <MdClose size={15} />
            </button>
          )}
        </div>
        <div className={styles.filterGroup}>
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              className={`${styles.filterBtn} ${filter === d ? styles.filterActive : ""}`}
              style={
                filter === d && d !== "All" ? { "--fc": DIFF_COLOR[d] } : {}
              }
              onClick={() => setFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <span>Loading problems...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.stateBox}>
            <MdOutlineAssignment size={40} color="#cbd5e1" />
            <p className={styles.stateText}>
              {search || filter !== "All"
                ? "No problems match your filters"
                : "No problems yet"}
            </p>
            {!search && filter === "All" && (
              <button
                className={styles.addBtn}
                onClick={() => navigate("/admin/problems/new")}
              >
                <MdAdd size={16} /> Add First Problem
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Difficulty</th>
                  <th className={styles.th}>Created By</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdIdx}`}>{i + 1}</td>
                    <td
                      className={`${styles.td} ${styles.tdTitle}`}
                      onClick={() => navigate(`/admin/problems/edit/${p._id}`)}
                      title="Click to edit"
                    >
                      {p.title}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.diffBadge}
                        style={{
                          color: DIFF_COLOR[p.difficulty],
                          background: DIFF_BG[p.difficulty],
                          border: `1px solid ${DIFF_COLOR[p.difficulty]}30`,
                        }}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {p.createdBy?.username ?? "—"}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.statusBadge} ${p.isPublished ? styles.published : styles.draft}`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        {/* Edit */}
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() =>
                            navigate(`/admin/problems/edit/${p._id}`)
                          }
                          title="Edit"
                        >
                          <MdEdit size={14} /> Edit
                        </button>

                        {/* Publish / Unpublish — admin only */}
                        {admin?.role === "admin" && (
                          <button
                            className={`${styles.actionBtn} ${p.isPublished ? styles.unpublishBtn : styles.publishBtn}`}
                            onClick={() => handleToggle(p)}
                            disabled={actionId === p._id}
                            title={p.isPublished ? "Unpublish" : "Publish"}
                          >
                            {p.isPublished ? (
                              <>
                                <MdVisibilityOff size={14} /> Unpublish
                              </>
                            ) : (
                              <>
                                <MdVisibility size={14} /> Publish
                              </>
                            )}
                          </button>
                        )}

                        {/* Delete — admin only */}
                        {admin?.role === "admin" && (
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => setDeleteId(p._id)}
                            disabled={actionId === p._id}
                            title="Delete"
                          >
                            <MdDelete size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table footer */}
      {!loading && filtered.length > 0 && (
        <div className={styles.tableFooter}>
          Showing {filtered.length} of {problems.length} problems
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <MdWarning size={22} color="#dc2626" />
            </div>
            <div className={styles.modalTitle}>Delete Problem?</div>
            <p className={styles.modalDesc}>
              This action cannot be undone. The problem and all its test cases
              will be permanently removed.
            </p>
            <div className={styles.modalBtns}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className={styles.modalDeleteBtn}
                onClick={confirmDelete}
                disabled={!!actionId}
              >
                <MdDelete size={15} />
                {actionId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
