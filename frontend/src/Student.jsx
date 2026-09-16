import React, { useContext, useState, useEffect } from 'react';
import { StateContext } from './App';
import { Users, UserCircle2, Save, UserCheck, ShieldCheck, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Student() {
    const { appState, DEFAULT_ADMIN_PASSWORD } = useContext(StateContext);
    const [profile, setProfile] = useState({ rollNumber: '', name: '' });
    const [adminPassword, setAdminPassword] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [view, setView] = useState('profile'); // 'profile' or 'status'

    useEffect(() => {
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
            const data = JSON.parse(savedProfile);
            setProfile({ rollNumber: data.rollNumber || '', name: data.name || '' });
            setIsSaved(true);
        }
    }, []);

    const saveProfile = (e) => {
        e.preventDefault();

        const cleanRoll = profile.rollNumber.trim();
        const cleanName = profile.name.trim();

        if (!cleanRoll || !cleanName) {
            alert("Please fill all details!");
            return;
        }

        const cleanEntered = adminPassword.trim();
        const activePass = (appState.superAdminPassword || localStorage.getItem('superAdminPassword') || DEFAULT_ADMIN_PASSWORD || 'admin123').trim();
        const fallbackPass = (DEFAULT_ADMIN_PASSWORD || 'admin123').trim();

        // Verify Admin Password
        if (cleanEntered !== activePass && cleanEntered !== fallbackPass) {
            alert("Invalid Super Admin Password! Please ask hostel staff to provide the valid password.");
            return;
        }

        try {
            const profileToSave = {
                rollNumber: cleanRoll.toUpperCase(),
                name: cleanName,
                studentId: cleanRoll.toUpperCase()
            };
            localStorage.setItem('studentProfile', JSON.stringify(profileToSave));
            setProfile({ rollNumber: profileToSave.rollNumber, name: profileToSave.name });
            setIsSaved(true);
            setShowSuccess(true);
            setAdminPassword('');
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            alert("Local storage is disabled. Please enable it to save your profile.");
        }
    };

    const toggleView = () => {
        setView(prev => prev === 'profile' ? 'status' : 'profile');
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '600px', alignSelf: 'center', marginTop: '5vh' }}>
            {showSuccess && (
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--secondary)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CheckCircle size={20} /> Profile Activated Successfully!
                </div>
            )}

            <div className="view-switcher-container" style={{ position: 'relative' }}>
                <button
                    onClick={toggleView}
                    className="nav-arrow left"
                    aria-label="Previous card"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="card-container">
                    {view === 'status' ? (() => {
                        const todayStr = new Date().toLocaleDateString('en-CA');
                        const todayLogs = appState.dailyLogs[todayStr] || [];
                        const hasRegisteredToday = isSaved && todayLogs.some(log => log.rollNumber?.toLowerCase() === profile.rollNumber?.toLowerCase());

                        return (
                            <div className="card animate-slide-in" style={{ padding: '2rem', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <UserCircle2 color="var(--primary)" />
                                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Portal Status</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Registration Status */}
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                        <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Progress</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600 }}>Day Registered?</span>
                                            <span className={`badge ${hasRegisteredToday ? 'badge-present' : 'badge-absent'}`}>
                                                {hasRegisteredToday ? 'Registered' : 'Not Yet'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Staff Presence */}
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                        <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Security Status</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600 }}>Staff in Hostel?</span>
                                            <span className={`badge ${appState.staffStatus === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                                                {appState.staffStatus === 'Present' ? 'In Hostel' : 'Out of Office'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Counts Section */}
                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                        <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Daily Capacity</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div style={{ borderRight: '1px solid var(--border)', paddingRight: '0.5rem' }}>
                                                <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>Registered</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--secondary)' }}>{appState.registeredCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>Remaining</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: appState.registeredCount >= 150 ? 'var(--danger)' : 'var(--text-main)' }}>
                                                    {Math.max(0, 150 - appState.registeredCount)}
                                                </p>
                                            </div>
                                        </div>
                                        {appState.registeredCount >= 150 && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                                                Today reached maximum counts (150/150)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="card animate-slide-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <ShieldCheck color="var(--primary)" />
                                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Student Profile</h2>
                            </div>

                            {isSaved ? (
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <p style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>{profile.name}</p>
                                            <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>{profile.rollNumber.toUpperCase()}</p>
                                        </div>
                                        <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                                            <UserCheck size={24} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>Automatic Mode Active</p>
                                    </div>
                                    <button className="btn" onClick={() => setIsSaved(false)} style={{ background: 'transparent', border: '1px solid var(--border)', fontSize: '0.8rem', width: '100%' }}>
                                        Edit Details (Requires Password)
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Setup requires **Admin Password** for security.</p>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.75rem' }}>Roll Number</label>
                                        <input type="text" className="input" placeholder="e.g. 21CS01" value={profile.rollNumber} onChange={e => setProfile({ ...profile, rollNumber: e.target.value })} required style={{ textTransform: 'uppercase' }} />
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.75rem' }}>Full Name</label>
                                        <input type="text" className="input" placeholder="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.75rem' }}>Super Admin Password</label>
                                        <input type="password" className="input" placeholder="Enter Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                                        <Save size={18} /> Save & Activate
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleView}
                    className="nav-arrow right"
                    aria-label="Next card"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div
                    onClick={() => setView('profile')}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: view === 'profile' ? 'var(--primary)' : 'var(--border)', cursor: 'pointer', transition: 'var(--transition)' }}
                />
                <div
                    onClick={() => setView('status')}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: view === 'status' ? 'var(--primary)' : 'var(--border)', cursor: 'pointer', transition: 'var(--transition)' }}
                />
            </div>

            <div className="card text-center" style={{ marginTop: '2rem', padding: '1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                    *Privacy Note: Your profile details are stored only on this phone for instant registration.
                </p>
            </div>

            <style>{`
                .view-switcher-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }
                .card-container {
                    flex: 1;
                    min-height: 480px;
                }
                .nav-arrow {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    color: var(--text-main);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition);
                    flex-shrink: 0;
                }
                .nav-arrow:hover {
                    background: var(--primary);
                    border-color: var(--primary);
                    transform: scale(1.1);
                }
                .animate-slide-in {
                    animation: slideIn 0.4s ease-out forwards;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @media (max-width: 480px) {
                    .nav-arrow {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        z-index: 10;
                        background: rgba(30, 41, 59, 0.8);
                        backdrop-filter: blur(4px);
                    }
                    .nav-arrow.left { left: -10px; }
                    .nav-arrow.right { right: -10px; }
                    .card-container { min-height: 520px; }
                }
            `}</style>
        </div>
    );
}
