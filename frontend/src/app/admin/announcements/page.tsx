"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2 } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { ToastNotification } from "@/components/admin/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { adminFetch } from "@/lib/adminApi";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? '';
  const { toast, success, error: toastError } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    buttonText: "",
    buttonUrl: "",
    isActive: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await adminFetch("/announcements", { token });
      setAnnouncements(data.data as Announcement[]);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Announcement) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        buttonText: item.buttonText || "",
        buttonUrl: item.buttonUrl || "",
        isActive: item.isActive,
      });
      setImagePreview(item.imageUrl);
    } else {
      setEditingItem(null);
      setFormData({ title: "", content: "", buttonText: "", buttonUrl: "", isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ title: "", content: "", buttonText: "", buttonUrl: "", isActive: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      if (formData.buttonText) formDataToSend.append("buttonText", formData.buttonText);
      if (formData.buttonUrl) formDataToSend.append("buttonUrl", formData.buttonUrl);
      formDataToSend.append("isActive", formData.isActive.toString());
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const url = editingItem ? `/announcements/${editingItem.id}` : "/announcements";
      const method = editingItem ? "PUT" : "POST";

      const data = await adminFetch(url, {
        token,
        method,
        body: formDataToSend,
      });

      if (data.success) {
        fetchAnnouncements();
        handleCloseModal();
        success(editingItem ? 'Announcement updated!' : 'Announcement created!');
      } else {
        toastError(data.message || "Failed to save announcement");
      }
    } catch (error) {
      toastError("Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const data = await adminFetch(`/announcements/${id}`, { token, method: "DELETE" });
      if (data.success) {
        fetchAnnouncements();
        success('Announcement deleted.');
      } else {
        toastError(data.message || "Failed to delete");
      }
    } catch (error) {
      toastError("Failed to delete announcement");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const data = await adminFetch(`/announcements/${id}/toggle`, { token, method: "PATCH" });
      if (data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
          <p className="theme-copy">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastNotification toast={toast} />
      <div className="admin-page-header">
        <div>
          <h2>Announcements</h2>
          <p>Manage popup announcements shown on the home page</p>
        </div>
        <GlassButton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} />
          Create Announcement
        </GlassButton>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 border theme-soft-border rounded-2xl">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="theme-copy text-lg mb-4">No announcements found</p>
          <GlassButton onClick={() => handleOpenModal()}>Create First Announcement</GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              {item.imageUrl && (
                <div className="aspect-video w-full bg-black/50 relative overflow-hidden border-b border-white/10">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold theme-heading text-lg leading-tight">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="theme-copy text-sm mb-4 line-clamp-3">{item.content}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-end gap-2 border-t border-white/5">
                  <button onClick={() => handleToggleActive(item.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={item.isActive ? "Deactivate" : "Activate"}>
                    {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleOpenModal(item)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatedModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Announcement" : "Create Announcement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block theme-copy text-sm font-semibold mb-1">Title</label>
            <GlassInput
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Server Maintenance"
            />
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-1">Content / Message</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-pink focus:outline-none theme-text resize-none"
              placeholder="Type your announcement here..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block theme-copy text-sm font-semibold mb-1">Button Text (Optional)</label>
              <GlassInput
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="e.g. Read More"
              />
            </div>
            <div>
              <label className="block theme-copy text-sm font-semibold mb-1">Button Link (Optional)</label>
              <GlassInput
                type="text"
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                placeholder="e.g. /contact"
              />
            </div>
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-2">Image (Optional)</label>
            <div className="border-2 border-dashed theme-soft-border rounded-xl p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon size={32} className="mx-auto mb-2 text-gray-400" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="announcement-upload" />
                  <label htmlFor="announcement-upload" className="inline-block px-4 py-2 bg-brand-pink text-white rounded-lg cursor-pointer hover:bg-brand-pink/90 transition-colors">
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
              <label htmlFor="isActive" className="theme-copy text-sm">Set as Active (this will deactivate other announcements)</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton type="button" onClick={handleCloseModal} variant="secondary">Cancel</GlassButton>
            <GlassButton type="submit" disabled={submitting}>
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : editingItem ? 'Update' : 'Create'
              }
            </GlassButton>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
}
