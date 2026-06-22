"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { adminFetch } from "@/lib/adminApi";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Game {
  id: string;
  name: string;
  logo: string | null;
  status: string;
  displayOrder: number;
}

export default function GamesManagementPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? '';
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: null as File | null,
    status: "ACTIVE",
    displayOrder: 0,
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await adminFetch("/games", { token });
      setGames(response.data as Game[]);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("displayOrder", formData.displayOrder.toString());
      if (formData.logo) {
        formDataToSend.append("image", formData.logo);
      }

      if (editingGame) {
        await adminFetch(`/games/${editingGame.id}`, { token, method: "PUT", body: formDataToSend });
      } else {
        await adminFetch("/games", { token, method: "POST", body: formDataToSend });
      }

      setIsModalOpen(false);
      setEditingGame(null);
      setFormData({ name: "", logo: null, status: "ACTIVE", displayOrder: 0 });
      await fetchGames();
      showToast('success', editingGame ? 'Game updated!' : 'Game created successfully!');
    } catch (error) {
      console.error("Error saving game:", error);
      showToast('error', 'Failed to save game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      await adminFetch(`/games/${id}`, { token, method: "DELETE" });
      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminFetch(`/games/${id}/toggle`, { token, method: "PATCH" });
      fetchGames();
    } catch (error) {
      console.error("Error toggling game status:", error);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      logo: null,
      status: game.status,
      displayOrder: game.displayOrder,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Toast notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed', top: 20, right: 20, zIndex: 9999,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 20px', borderRadius: 14,
                background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                backdropFilter: 'blur(12px)',
                color: toast.type === 'success' ? '#10B981' : '#ef4444',
                fontWeight: 700, fontSize: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {toast.type === 'success'
                ? <CheckCircle size={18} />
                : <XCircle size={18} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="flex items-center gap-2 text-brand-pink hover:text-white transition-colors">
                <ArrowLeft size={20} />
                Back
              </button>
            </Link>
            <h1 className="text-3xl font-bold theme-heading">Games Management</h1>
          </div>
          <button
            onClick={() => {
              setEditingGame(null);
              setFormData({ name: "", logo: null, status: "ACTIVE", displayOrder: 0 });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-pink to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            Add Game
          </button>
        </div>

        {/* Games List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-brand-pink/20">
            <p className="text-lg theme-muted">No games found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-6 border border-brand-pink/20"
              >
                <div className="flex items-center justify-between mb-4">
                  {game.logo ? (
                    <img src={game.logo} alt={game.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-brand-pink/20 to-purple-500/20 rounded-xl">
                      <span className="text-3xl">🎮</span>
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      game.status === "ACTIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold theme-heading mb-2">{game.name}</h3>
                <p className="text-sm theme-muted mb-4">Order: {game.displayOrder}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(game)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-pink/20 text-brand-pink rounded-lg hover:bg-brand-pink/30 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(game.id)}
                    className="flex items-center justify-center px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                  >
                    {game.status === "ACTIVE" ? (
                      <ToggleRight size={16} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-2xl p-8 w-full max-w-md border border-brand-pink/20"
            >
              <h2 className="text-2xl font-bold theme-heading mb-6">
                {editingGame ? "Edit Game" : "Add Game"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold theme-heading mb-2">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-pink focus:outline-none theme-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-heading mb-2">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-pink focus:outline-none theme-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-heading mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-pink focus:outline-none theme-text"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-heading mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-pink focus:outline-none theme-text"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-pink to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {editingGame ? "Updating…" : "Creating…"}
                      </>
                    ) : (
                      editingGame ? "Update" : "Create"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
