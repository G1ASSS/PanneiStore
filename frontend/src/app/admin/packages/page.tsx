"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, DollarSign, X, Check, Loader2 } from "lucide-react";
import { ToastNotification } from "@/components/admin/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { adminFetch } from "@/lib/adminApi";

interface Game { id: string; name: string; }
interface Package {
  id: string; gameId: string; packageName: string;
  price: number; category: string; status: string;
  displayOrder: number; game: Game;
}

const emptyForm = { gameId: "", packageName: "", price: 0, category: "", status: "ACTIVE", displayOrder: 0 };

export default function PackagesManagementPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? "";
  const { toast, success, error: toastError } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterGame, setFilterGame] = useState("ALL");

  useEffect(() => { fetchAll(); }, [token]);

  const fetchAll = async () => {
    if (!token) return;
    try {
      const [pkgRes, gameRes] = await Promise.all([
        adminFetch<Package[]>("/topup-packages", { token }),
        adminFetch<Game[]>("/games", { token }),
      ]);
      setPackages(pkgRes.data);
      setGames(gameRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingPackage(null); setFormData(emptyForm); setIsModalOpen(true); };
  const openEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({ gameId: pkg.gameId, packageName: pkg.packageName, price: pkg.price, category: pkg.category, status: pkg.status, displayOrder: pkg.displayOrder });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { ...formData, price: Number(formData.price), displayOrder: Number(formData.displayOrder) };
      if (editingPackage) {
        await adminFetch(`/topup-packages/${editingPackage.id}`, { token, method: "PUT", body: JSON.stringify(body) });
        success('Package updated!');
      } else {
        await adminFetch("/topup-packages", { token, method: "POST", body: JSON.stringify(body) });
        success('Package created successfully!');
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (e) { toastError("Failed to save package"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    try { await adminFetch(`/topup-packages/${id}`, { token, method: "DELETE" }); fetchAll(); success('Package deleted.'); }
    catch (e) { toastError("Failed to delete"); }
  };

  const handleToggle = async (id: string) => {
    try { await adminFetch(`/topup-packages/${id}/toggle`, { token, method: "PATCH" }); fetchAll(); }
    catch (e) { toastError("Failed to toggle status"); }
  };

  const filtered = filterGame === "ALL" ? packages : packages.filter(p => p.gameId === filterGame);
  const grouped = filtered.reduce((acc, pkg) => {
    const name = pkg.game?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(pkg);
    return acc;
  }, {} as Record<string, Package[]>);

  return (
    <div>
      <ToastNotification toast={toast} />
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Top-Up Prices</h2>
          <p>Manage game top-up package prices and availability</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Add Package
        </button>
      </div>

      {/* Game filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilterGame("ALL")}
          style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: filterGame === "ALL" ? "linear-gradient(135deg,#ff2e93,#a12cff)" : "var(--card)",
            color: filterGame === "ALL" ? "#fff" : "var(--muted)",
            border: filterGame === "ALL" ? "none" : "1px solid var(--card-border)",
          }}
        >All Games</button>
        {games.map(g => (
          <button key={g.id} onClick={() => setFilterGame(g.id)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: filterGame === g.id ? "linear-gradient(135deg,#ff2e93,#a12cff)" : "var(--card)",
            color: filterGame === g.id ? "#fff" : "var(--muted)",
            border: filterGame === g.id ? "none" : "1px solid var(--card-border)",
          }}>{g.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: "center", padding: 40 }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-pink mx-auto" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: 48 }}>
          <DollarSign size={40} style={{ margin: "0 auto 12px", color: "var(--muted)" }} />
          <p style={{ color: "var(--muted)" }}>No packages found. Click <strong>Add Package</strong> to create one.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([gameName, pkgs]) => (
          <div key={gameName} className="admin-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: 16 }}>🎮 {gameName}</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Category</th>
                    <th style={{ color: "#ff2e93" }}>💰 Price (MMK)</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pkgs.map(pkg => (
                    <motion.tr key={pkg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td><strong>{pkg.packageName}</strong></td>
                      <td><span style={{ background: "rgba(161,44,255,0.15)", color: "#a12cff", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{pkg.category}</span></td>
                      <td>
                        <span style={{ fontWeight: 900, fontSize: 16, color: "#ff2e93" }}>
                          {Number(pkg.price).toLocaleString()}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>MMK</span>
                      </td>
                      <td>{pkg.displayOrder}</td>
                      <td>
                        <span style={{
                          background: pkg.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                          color: pkg.status === "ACTIVE" ? "#10B981" : "#ef4444",
                          padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        }}>{pkg.status}</span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button onClick={() => openEdit(pkg)} className="btn-sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Edit2 size={13} /> Edit Price
                          </button>
                          <button onClick={() => handleToggle(pkg.id)} className="btn-sm btn-secondary" title="Toggle status">
                            {pkg.status === "ACTIVE" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button onClick={() => handleDelete(pkg.id)} className="btn-sm btn-danger">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontWeight: 900, fontSize: 20 }}>{editingPackage ? "✏️ Edit Package" : "➕ Add Package"}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--muted)" }}>Game</label>
                  <select value={formData.gameId} onChange={e => setFormData({ ...formData, gameId: e.target.value })} required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--card-border)", color: "var(--heading)", fontSize: 14 }}>
                    <option value="">Select game…</option>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--muted)" }}>Package Name</label>
                  <input type="text" value={formData.packageName} onChange={e => setFormData({ ...formData, packageName: e.target.value })} required placeholder="e.g. 86 Diamonds"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--card-border)", color: "var(--heading)", fontSize: 14 }} />
                </div>

                {/* PRICE — most prominent field */}
                <div style={{ background: "rgba(255,46,147,0.06)", border: "1px solid rgba(255,46,147,0.2)", borderRadius: 14, padding: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, marginBottom: 8, color: "#ff2e93" }}>💰 Price (MMK)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required min={0}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "2px solid rgba(255,46,147,0.3)", color: "var(--heading)", fontSize: 20, fontWeight: 900 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--muted)" }}>Category</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required placeholder="e.g. Diamonds"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--card-border)", color: "var(--heading)", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--muted)" }}>Display Order</label>
                    <input type="number" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} min={0}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--card-border)", color: "var(--heading)", fontSize: 14 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--muted)" }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--card-border)", color: "var(--heading)", fontSize: 14 }}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {saving ? "Saving…" : <><Check size={16} /> {editingPackage ? "Update" : "Create"}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
