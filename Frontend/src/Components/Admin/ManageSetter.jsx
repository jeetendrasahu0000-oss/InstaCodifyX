import React, { useEffect, useState } from 'react';
import {
    HiOutlineUsers,
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineShieldCheck,
    HiOutlineCalendar,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineExclamation,
    HiOutlineCheckCircle,
    HiOutlineUserGroup,
} from 'react-icons/hi';
import styles from './ManageSetter.module.css';
import { getAllSettersAPI, deleteSetterAPI } from '../Admin/adminApi';

/* ── initials helper ─────────────────────────────────── */
const initials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

/* ── short ID helper ─────────────────────────────────── */
const shortId = (id = '') => `#${id.slice(-6).toUpperCase()}`;

/* ══════════════════════════════════════════════════════ */
const ManageSetter = () => {
    const [setters, setSetters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSetter, setSelectedSetter] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    /* ── fetch ─────────────────────────────────────────── */
    const fetchSetters = async () => {
        setLoading(true);
        try {
            const { data } = await getAllSettersAPI();
            setSetters(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSetters(); }, []);

    /* ── delete ─────────────────────────────────────────── */
    const handleDelete = async () => {
        try {
            await deleteSetterAPI(confirmId);
            setConfirmId(null);
            fetchSetters();
        } catch (err) {
            console.error(err);
        }
    };

    /* ══ render ══════════════════════════════════════════ */
    return (
        <div className={styles.root}>
            <div className={styles.wrapper}>

                {/* ── Header ──────────────────────────────────── */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.eyebrow}>
                            <HiOutlineUserGroup size={13} />
                            Admin Panel
                        </span>
                        <h2>Manage Problem Setters</h2>
                        <p>View, inspect, and remove setter accounts from the platform</p>
                    </div>

                    <span className={styles.countBadge}>
                        <HiOutlineUsers size={15} />
                        {setters.length} Setter{setters.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ── Table Card ──────────────────────────────── */}
                <div className={styles.card}>
                    {loading ? (
                        <div className={styles.stateBox}>
                            <div className={styles.spinnerRing} />
                            <p>Loading setters…</p>
                        </div>
                    ) : setters.length === 0 ? (
                        <div className={styles.stateBox}>
                            <HiOutlineUsers size={44} />
                            <p>No setters found</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Setter</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {setters.map(setter => (
                                    <tr key={setter._id}>

                                        {/* Setter */}
                                        <td>
                                            <div className={styles.avatarCell}>
                                                <div className={styles.avatar}>{initials(setter.username)}</div>
                                                <div className={styles.usernameWrap}>
                                                    <span className={styles.username}>{setter.username}</span>
                                                    <span className={styles.uid}>{shortId(setter._id)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>
                                            <div className={styles.emailCell}>
                                                <HiOutlineMail size={14} />
                                                {setter.email}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td>
                                            <span className={styles.dateChip}>
                                                <HiOutlineCalendar size={13} />
                                                {new Date(setter.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className={styles.actionsCell}>
                                                <button
                                                    className={styles.btnView}
                                                    onClick={() => setSelectedSetter(setter)}
                                                >
                                                    <HiOutlineEye size={15} />
                                                    View
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() => setConfirmId(setter._id)}
                                                >
                                                    <HiOutlineTrash size={15} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── View Modal ──────────────────────────────── */}
                {selectedSetter && (
                    <div className={styles.overlay} onClick={() => setSelectedSetter(null)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className={styles.modalHeader}>
                                <div className={styles.modalHeaderLeft}>
                                    <span className={styles.modalHeaderLabel}>Setter Profile</span>
                                    <h3>Account Details</h3>
                                </div>
                                <button className={styles.btnClose} onClick={() => setSelectedSetter(null)}>
                                    <HiOutlineX size={16} />
                                </button>
                            </div>

                            {/* Profile Banner */}
                            <div className={styles.modalProfile}>
                                <div className={styles.modalAvatarLg}>
                                    {initials(selectedSetter.username)}
                                </div>
                                <div className={styles.modalProfileInfo}>
                                    <h4>{selectedSetter.username}</h4>
                                    <p>{selectedSetter.email}</p>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className={styles.modalBody}>

                                <div className={styles.modalField}>
                                    <span className={styles.fieldIcon}>
                                        <HiOutlineUser size={15} />
                                    </span>
                                    <div className={styles.fieldContent}>
                                        <span className={styles.fieldLabel}>Username</span>
                                        <span className={styles.fieldValue}>{selectedSetter.username}</span>
                                    </div>
                                </div>

                                <div className={styles.modalField}>
                                    <span className={styles.fieldIcon}>
                                        <HiOutlineMail size={15} />
                                    </span>
                                    <div className={styles.fieldContent}>
                                        <span className={styles.fieldLabel}>Email Address</span>
                                        <span className={styles.fieldValue}>{selectedSetter.email}</span>
                                    </div>
                                </div>

                                <div className={styles.modalField}>
                                    <span className={styles.fieldIcon}>
                                        <HiOutlineShieldCheck size={15} />
                                    </span>
                                    <div className={styles.fieldContent}>
                                        <span className={styles.fieldLabel}>Role</span>
                                        <span className={styles.rolePill}>
                                            <HiOutlineCheckCircle size={12} />
                                            {selectedSetter.role}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.modalField}>
                                    <span className={styles.fieldIcon}>
                                        <HiOutlineCalendar size={15} />
                                    </span>
                                    <div className={styles.fieldContent}>
                                        <span className={styles.fieldLabel}>Member Since</span>
                                        <span className={styles.fieldValue}>
                                            {new Date(selectedSetter.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Footer */}
                            <div className={styles.modalFooter}>
                                <button className={styles.btnFullClose} onClick={() => setSelectedSetter(null)}>
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* ── Delete Confirm Dialog ────────────────────── */}
                {confirmId && (
                    <div className={styles.overlay} onClick={() => setConfirmId(null)}>
                        <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>

                            <div className={styles.dangerIconWrap}>
                                <HiOutlineExclamation size={26} />
                            </div>

                            <h4>Delete this Setter?</h4>
                            <p>This action is permanent and cannot be undone. The setter will lose all access immediately.</p>

                            <div className={styles.confirmActions}>
                                <button className={styles.btnCancel} onClick={() => setConfirmId(null)}>
                                    Cancel
                                </button>
                                <button className={styles.btnConfirmDelete} onClick={handleDelete}>
                                    Yes, Delete
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManageSetter;