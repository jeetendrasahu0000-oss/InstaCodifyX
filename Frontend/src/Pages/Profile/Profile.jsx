import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../utils/api"
import { AuthContext } from "../../Context/AuthContext"
import style from "./Profile.module.css"
import Footer from "../Footer/Footer"
import Header from "../Header/Header"

const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?"

const AVATAR_COLORS = [
    ["#6366f1", "#4338ca"], ["#00b8a3", "#007a6e"], ["#f59e0b", "#b45309"],
    ["#ec4899", "#be185d"], ["#3b82f6", "#1d4ed8"], ["#8b5cf6", "#6d28d9"],
]
const getAvatarColors = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]

function Avatar({ user, size = 80, fontSize = 26, borderRadius = "50%" }) {
    const [colors] = useState(() => getAvatarColors(user?.fullname || user?.username || ""))
    if (user?.avatar) {
        return <img src={user.avatar} alt={user.fullname || user.username}
            className={style.avatarImg} style={{ width: size, height: size, borderRadius }} />
    }
    return (
        <span className={style.avatarInitials}
            style={{
                width: size, height: size, borderRadius, fontSize,
                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
            }}>
            {getInitials(user?.fullname || user?.username)}
        </span>
    )
}

function DonutChart({ solved = 0, easy = 0, medium = 0, hard = 0 }) {
    const total = 3878
    const r = 46, cx = 55, cy = 55
    const circ = 2 * Math.PI * r
    const ep = Math.min(easy / total, 1)
    const mp = Math.min(medium / total, 1)
    const hp = Math.min(hard / total, 1)
    const rem = Math.max(1 - ep - mp - hp, 0)
    const segs = [
        { p: ep,  color: "#1D9E75", off: 0           },
        { p: mp,  color: "#EF9F27", off: ep           },
        { p: hp,  color: "#E24B4A", off: ep + mp      },
        { p: rem, color: "#f1f3f4", off: ep + mp + hp },
    ]
    return (
        <div className={style.donutWrap}>
            <svg className={style.donutSvg} viewBox="0 0 110 110">
                {segs.map((s, i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={s.color} strokeWidth="10"
                        strokeDasharray={`${s.p * circ} ${circ}`}
                        strokeDashoffset={-s.off * circ} />
                ))}
            </svg>
            <div className={style.donutCenter}>
                <span className={style.donutNumber}>{solved}</span>
                <span className={style.donutLabel}>Solved</span>
            </div>
        </div>
    )
}

function Heatmap({ streak = 0, activeDays = 0 }) {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    const colors = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"]
    const weeks = 52
    return (
        <div className={style.heatmapCard}>
            <div className={style.heatmapHeader}>
                <p className={style.sectionTitle} style={{ margin: 0 }}>Submission activity</p>
                <div className={style.heatmapMeta}>
                    <span>Active days: <strong>{activeDays}</strong></span>
                    <span>Max streak: <strong>{streak}</strong></span>
                </div>
            </div>
            <div className={style.heatmapGrid}>
                {Array.from({ length: weeks }, (_, w) => (
                    <div key={w} className={style.heatmapCol}>
                        {Array.from({ length: 7 }, (_, d) => (
                            <div key={d} className={style.heatmapCell}
                                style={{ background: colors[0] }} />
                        ))}
                    </div>
                ))}
            </div>
            <div className={style.heatmapMonths}>
                {months.map((m) => (
                    <span key={m} className={style.heatmapMonthLabel}>{m}</span>
                ))}
            </div>
            <div className={style.heatmapLegend}>
                <span className={style.legendLabel}>Less</span>
                {colors.map((c, i) => (
                    <div key={i} className={style.legendCell} style={{ background: c }} />
                ))}
                <span className={style.legendLabel}>More</span>
            </div>
        </div>
    )
}

const RANKS = [
    { label: "Newbie",       min: 0,   color: "#9aa0a6" },
    { label: "Beginner",     min: 10,  color: "#1D9E75" },
    { label: "Intermediate", min: 50,  color: "#378ADD" },
    { label: "Advanced",     min: 150, color: "#8b5cf6" },
    { label: "Expert",       min: 300, color: "#EF9F27" },
    { label: "Master",       min: 500, color: "#E24B4A" },
    { label: "Legend",       min: 800, color: "#f59e0b" },
]

function getRankInfo(solved = 0) {
    let current = RANKS[0], next = RANKS[1]
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (solved >= RANKS[i].min) {
            current = RANKS[i]
            next    = RANKS[i + 1] || null
            break
        }
    }
    const progress = next
        ? Math.min(((solved - current.min) / (next.min - current.min)) * 100, 100)
        : 100
    return { current, next, progress }
}

function RankCard({ solved = 0 }) {
    const { current, next, progress } = getRankInfo(solved)
    return (
        <div className={style.rankCard}>
            <div className={style.rankCardHeader}>
                <p className={style.sectionTitle} style={{ margin: 0 }}>Rank Progress</p>
                <span className={style.rankBadgeInline}
                    style={{
                        color: current.color,
                        borderColor: current.color + "44",
                        background: current.color + "12"
                    }}>
                    {current.label}
                </span>
            </div>
            <div className={style.rankBarWrap}>
                <div className={style.rankBar}>
                    <div className={style.rankBarFill}
                        style={{ width: `${progress}%`, background: current.color }} />
                </div>
                <div className={style.rankBarLabels}>
                    <span style={{ color: current.color, fontSize: 11, fontWeight: 600 }}>
                        {current.min} solved
                    </span>
                    {next && (
                        <span style={{ color: "#9aa0a6", fontSize: 11 }}>
                            Next: {next.label} ({next.min})
                        </span>
                    )}
                </div>
            </div>
            <div className={style.rankTiers}>
                {RANKS.map((r, i) => (
                    <div key={i} className={style.rankTier}
                        style={{ opacity: solved >= r.min ? 1 : 0.35 }}>
                        <div className={style.rankTierDot} style={{ background: r.color }} />
                        <span className={style.rankTierLabel}
                            style={{ color: solved >= r.min ? r.color : "#9aa0a6" }}>
                            {r.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Profile() {
    const { username }              = useParams()
    const { user: authUser, updateUser } = useContext(AuthContext)
    const navigate                  = useNavigate()

    const [user, setUser]           = useState(null)
    const [edit, setEdit]           = useState(false)
    const [loading, setLoading]     = useState(true)
    const [saving, setSaving]       = useState(false)
    const [saveError, setSaveError] = useState("")
    const [error, setError]         = useState(null)
    const [form, setForm]           = useState({ fullname: "", username: "" })
    const [avatarPreview, setAvatarPreview] = useState("")
    const [avatarFile, setAvatarFile]       = useState(null)

    const isOwn = authUser?.username === username

    useEffect(() => { fetchProfile() }, [username])

    const fetchProfile = async () => {
        try {
            setLoading(true); setError(null)
            const res = await api.get(`/user/${username}`)
            setUser(res.data)
            setForm({ fullname: res.data.fullname || "", username: res.data.username || "" })
        } catch (err) {
            setError(err.response?.status === 404 ? "User not found" : "Something went wrong")
        } finally { setLoading(false) }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            setSaveError("Please select an image file."); return
        }
        if (file.size > 2 * 1024 * 1024) {
            setSaveError("Image must be under 2MB."); return
        }
        setSaveError("")
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleUpdate = async () => {
        setSaveError("")
        if (!form.fullname.trim()) { setSaveError("Full name is required."); return }
        if (!form.username.trim() || form.username.length < 3) { setSaveError("Username must be at least 3 characters."); return }
        if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setSaveError("Username: only letters, numbers, underscores."); return }

        try {
            setSaving(true)
            let updatedUser

            if (avatarFile) {
                const formData = new FormData()
                formData.append("avatar",   avatarFile)
                formData.append("fullname", form.fullname)
                formData.append("username", form.username)
                const res = await api.put("/user/profile", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                updatedUser = res.data
            } else {
                const res = await api.put("/user/profile", form)
                updatedUser = res.data
            }

            setUser(updatedUser)
            updateUser(updatedUser)
            setEdit(false)
            setAvatarFile(null)
            setAvatarPreview("")

            if (updatedUser.username !== username)
                navigate(`/profile/${updatedUser.username}`, { replace: true })

        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to save. Try again.")
        } finally { setSaving(false) }
    }

    const cancelEdit = () => {
        setEdit(false)
        setAvatarFile(null)
        setAvatarPreview("")
        setSaveError("")
        setForm({ fullname: user.fullname || "", username: user.username || "" })
    }

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : null

    if (loading) return (
        <>
            <Header />
            <div className={style.page}>
                <div className={style.layout}>
                    <div className={style.leftCol}>
                        <div className={style.profileCard}>
                            <div className={style.skeletonAvatar} />
                            <div className={style.skeletonLine} style={{ width: "55%", margin: "0 auto 8px" }} />
                            <div className={style.skeletonLine} style={{ width: "35%", margin: "0 auto 8px" }} />
                            <div className={style.skeletonStats}>
                                {[1, 2].map(i => <div key={i} className={style.skeletonStatBox} />)}
                            </div>
                        </div>
                    </div>
                    <div className={style.rightCol}>
                        <div className={style.statsCard} style={{ minHeight: 120 }}>
                            <div className={style.skeletonStatBox} style={{ width: 110, height: 110, borderRadius: "50%" }} />
                            <div style={{ flex: 1 }}>
                                <div className={style.skeletonLine} style={{ marginBottom: 12 }} />
                                <div className={style.skeletonLine} style={{ marginBottom: 12 }} />
                                <div className={style.skeletonLine} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )

    if (error) return (
        <>
            <Header />
            <div className={style.page}>
                <div className={style.layout}>
                    <div className={`${style.profileCard} ${style.errorCard}`}>
                        <div className={style.errorIcon}>⚠️</div>
                        <p className={style.errorText}>{error}</p>
                        <button className={style.retryBtn} onClick={fetchProfile}>Retry</button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )

    return (
        <>
            <Header />
            <div className={style.page}>
                <div className={style.layout}>

                    {/* ══ LEFT ══ */}
                    <div className={style.leftCol}>

                        {/* Profile Card */}
                        <div className={style.profileCard}>
                            {isOwn && !edit && (
                                <button className={style.editIconBtn} onClick={() => setEdit(true)}>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                            )}

                            {!edit ? (
                                <>
                                    <div className={style.avatarWrap}>
                                        <Avatar user={user} size={80} fontSize={26} borderRadius="50%" />
                                        {user?.isVerified && (
                                            <span className={style.verifiedBadge}>
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                                    <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className={style.name}>{user?.fullname || user?.username}</h2>
                                    <p className={style.usernameText}>@{user?.username}</p>
                                    {user?.role && <span className={style.roleBadge}>{user.role}</span>}
                                    {isOwn && (
                                        <button className={style.editBtn} onClick={() => setEdit(true)}>
                                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Edit profile
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className={style.editForm}>

                                    {/* Avatar Upload */}
                                    <div className={style.avatarUploadWrap}>
                                        <div className={style.avatarUploadPreview}>
                                            {avatarPreview || user?.avatar ? (
                                                <img
                                                    src={avatarPreview || user.avatar}
                                                    alt="preview"
                                                    className={style.avatarUploadImg}
                                                />
                                            ) : (
                                                <Avatar user={{ ...user, avatar: null }} size={70} fontSize={22} borderRadius="50%" />
                                            )}
                                            <label htmlFor="avatarInput" className={style.avatarOverlay}>
                                                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                    <circle cx="12" cy="13" r="4" />
                                                </svg>
                                                <span>Change</span>
                                            </label>
                                        </div>
                                        <input
                                            id="avatarInput"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={handleFileChange}
                                        />
                                        {avatarPreview && (
                                            <button type="button" className={style.removeAvatarBtn}
                                                onClick={() => { setAvatarFile(null); setAvatarPreview("") }}>
                                                Remove photo
                                            </button>
                                        )}
                                        <span className={style.avatarHint}>JPG, PNG · Max 2MB</span>
                                    </div>

                                    <label className={style.fieldLabel}>Full name</label>
                                    <input className={style.input} placeholder="Full Name"
                                        value={form.fullname}
                                        onChange={e => setForm({ ...form, fullname: e.target.value })} />

                                    <label className={style.fieldLabel}>Username</label>
                                    <input className={style.input} placeholder="Username"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })} />

                                    {saveError && (
                                        <p className={style.saveError}>⚠ {saveError}</p>
                                    )}

                                    <div className={style.editActions}>
                                        <button className={style.saveBtn} onClick={handleUpdate} disabled={saving}>
                                            {saving ? "Saving…" : "Save changes"}
                                        </button>
                                        <button className={style.cancelBtn} onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Personal Info */}
                        <div className={style.infoCard}>
                            <p className={style.sectionTitle}>Personal information</p>
                            <div className={style.infoRow}>
                                <svg className={style.infoIcon} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                {isOwn ? user?.email : "Hidden"}
                            </div>
                            <div className={style.infoRow}>
                                <svg className={style.infoIcon} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                India
                            </div>
                            {joinDate && (
                                <div className={style.infoRow}>
                                    <svg className={style.infoIcon} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Joined {joinDate}
                                </div>
                            )}
                        </div>

                        {/* Community Stats */}
                        <div className={style.communityCard}>
                            <p className={style.sectionTitle}>Community stats</p>
                            {[
                                { label: "Views",      color: "#378ADD", val: user?.views      ?? 0 },
                                { label: "Solutions",  color: "#378ADD", val: user?.solutions  ?? 0 },
                                { label: "Discuss",    color: "#1D9E75", val: user?.discuss    ?? 0 },
                                { label: "Reputation", color: "#EF9F27", val: user?.reputation ?? 0 },
                            ].map(item => (
                                <div key={item.label} className={style.communityRow}>
                                    <span className={style.communityDot} style={{ background: item.color }} />
                                    <span className={style.communityName}>{item.label}</span>
                                    <span className={style.communityVal}>{item.val}</span>
                                    <span className={style.communitySub}>Last week 0</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ RIGHT ══ */}
                    <div className={style.rightCol}>

                        {/* Solved Stats */}
                        <div className={style.statsCard}>
                            <DonutChart
                                solved={user?.solved ?? 0}
                                easy={user?.easy     ?? 0}
                                medium={user?.medium ?? 0}
                                hard={user?.hard     ?? 0}
                            />
                            <div className={style.diffList}>
                                {[
                                    { label: "Easy", color: "#1D9E75", val: user?.easy   ?? 0, total: 933  },
                                    { label: "Med.", color: "#EF9F27", val: user?.medium ?? 0, total: 2029 },
                                    { label: "Hard", color: "#E24B4A", val: user?.hard   ?? 0, total: 916  },
                                ].map(d => (
                                    <div key={d.label} className={style.diffRow}>
                                        <span className={style.diffLabel} style={{ color: d.color }}>{d.label}</span>
                                        <div className={style.diffBar}>
                                            <div className={style.diffBarFill}
                                                style={{ background: d.color, width: `${Math.min((d.val / d.total) * 100, 100)}%` }} />
                                        </div>
                                        <span className={style.diffCount}>
                                            {d.val}<span style={{ color: "#bdc1c6" }}>/{d.total}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Streak */}
                        <div className={style.streakCard}>
                            <div className={style.streakItem}>
                                <span className={style.streakNum}>{user?.streak ?? 0}</span>
                                <span className={style.streakLbl}>Current streak</span>
                            </div>
                            <div className={style.streakDivider} />
                            <div className={style.streakItem}>
                                <span className={style.streakNum} style={{ fontSize: 22 }}>{user?.maxStreak ?? 0}</span>
                                <span className={style.streakLbl}>Max streak</span>
                            </div>
                            <div className={style.streakDivider} />
                            <div className={style.streakItem}>
                                <span className={style.streakNum} style={{ fontSize: 22 }}>{user?.activeDays ?? 0}</span>
                                <span className={style.streakLbl}>Active days</span>
                            </div>
                        </div>

                        {/* Rank Progress */}
                        <RankCard solved={user?.solved ?? 0} />

                        {/* Heatmap */}
                        <Heatmap
                            streak={user?.maxStreak    ?? 0}
                            activeDays={user?.activeDays ?? 0}
                        />

                        {/* Badges */}
                        <div className={style.badgesCard}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                <p className={style.sectionTitle} style={{ margin: 0 }}>Badges</p>
                                <span style={{ fontSize: 20, fontWeight: 600, color: "#202124" }}>
                                    {user?.badges ?? 0}
                                </span>
                            </div>
                            <p className={style.badgeEmpty}>
                                No badges unlocked yet. Start solving problems to earn badges.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}