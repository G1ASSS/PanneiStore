"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { ToastNotification } from "@/components/admin/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { adminFetch } from "@/lib/adminApi";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}

export default function HeroBannersPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? '';
  const { toast, success, error: toastError } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonUrl: "",
    displayOrder: 0,
    isActive: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await adminFetch("/hero-banners", { token });
      setBanners(data.data as HeroBanner[]);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner?: HeroBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        buttonText: banner.buttonText || "",
        buttonUrl: banner.buttonUrl || "",
        displayOrder: banner.displayOrder,
        isActive: banner.isActive,
      });
      setImagePreview(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setFormData({ title: "", subtitle: "", buttonText: "", buttonUrl: "", displayOrder: 0, isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({ title: "", subtitle: "", buttonText: "", buttonUrl: "", displayOrder: 0, isActive: true });
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
      if (formData.subtitle) formDataToSend.append("subtitle", formData.subtitle);
      if (formData.buttonText) formDataToSend.append("buttonText", formData.buttonText);
      if (formData.buttonUrl) formDataToSend.append("buttonUrl", formData.buttonUrl);
      formDataToSend.append("displayOrder", formData.displayOrder.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const url = editingBanner ? `/hero-banners/${editingBanner.id}` : "/hero-banners";
      const method = editingBanner ? "PUT" : "POST";

      const data = await adminFetch(url, {
        token,
        method,
        body: formDataToSend,
      });

      if (data.success) {
        fetchBanners();
        handleCloseModal();
        success(editingBanner ? 'Banner updated!' : 'Banner created successfully!');
      } else {
        toastError(data.message || "Failed to save banner");
      }
    } catch (error) {
      console.error("Failed to save banner:", error);
      toastError("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const data = await adminFetch(`/hero-banners/${id}`, { token, method: "DELETE" });
      if (data.success) {
        fetchBanners();
        success('Banner deleted.');
      } else {
        toastError(data.message || "Failed to delete");
      }
    } catch (error) {
      toastError("Failed to delete banner");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const data = await adminFetch(`/hero-banners/${id}/toggle`, { token, method: "PATCH" });
      if (data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    const photoIndex = banners.findIndex((p) => p.id === id);
    const newOrder = direction === "up" ? banners[photoIndex].displayOrder - 1 : banners[photoIndex].displayOrder + 1;

    try {
      const data = await adminFetch(`/hero-banners/${id}`, {
        token,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      if (data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Failed to update display order:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
          <p className="theme-copy">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastNotification toast={toast} />
      <div className="admin-page-header">
        <div>
          <h2>Home Banners</h2>
          <p>Manage the large rotating banners on the home page</p>
        </div>
        <GlassButton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} />
          Add Banner
        </GlassButton>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-16 border theme-soft-border rounded-2xl">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="theme-copy text-lg mb-4">No banners found</p>
          <GlassButton onClick={() => handleOpenModal()}>Add Your First Banner</GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="aspect-[21/9] w-full bg-black/50 relative overflow-hidden">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white font-bold uppercase tracking-wider">Inactive</span>
                  </div>
                )}
                
                {/* Text Overlay Preview */}
                <div className="absolute inset-0 p-6 flex flex-col justify-center bg-gradient-to-r from-black/80 via-black/40 to-transparent">
                  <h3 className="text-2xl font-black text-white mb-2 shadow-sm">{banner.title}</h3>
                  {banner.subtitle && <p className="text-white/80 mb-4">{banner.subtitle}</p>}
                  {banner.buttonText && (
                    <div className="mt-auto self-start px-4 py-2 bg-brand-pink text-white text-sm font-bold rounded-lg">
                      {banner.buttonText}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-between border-t border-white/10">
                <div>
                  <p className="text-xs theme-copy">Order: {banner.displayOrder}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMoveOrder(banner.id, "up")} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Move Up">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handleMoveOrder(banner.id, "down")} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Move Down">
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={() => handleToggleActive(banner.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={banner.isActive ? "Deactivate" : "Activate"}>
                    {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleOpenModal(banner)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatedModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBanner ? "Edit Banner" : "Add Banner"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block theme-copy text-sm font-semibold mb-1">Headline Text</label>
            <GlassInput
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. MEGA SALE"
            />
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-1">Subheadline (Optional)</label>
            <GlassInput
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Up to 50% off all MLBB Diamonds"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block theme-copy text-sm font-semibold mb-1">Button Text (Optional)</label>
              <GlassInput
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="e.g. Shop Now"
              />
            </div>
            <div>
              <label className="block theme-copy text-sm font-semibold mb-1">Button Link (Optional)</label>
              <GlassInput
                type="text"
                value={formData.buttonUrl}
                onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                placeholder="e.g. /games"
              />
            </div>
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-2">Background Image</label>
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
                  <p className="theme-copy text-sm mb-2">Ratio: 21:9 or 16:9 recommended</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="banner-upload" />
                  <label htmlFor="banner-upload" className="inline-block px-4 py-2 bg-brand-pink text-white rounded-lg cursor-pointer hover:bg-brand-pink/90 transition-colors">
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block theme-copy text-sm font-semibold mb-1">Display Order</label>
              <GlassInput
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
              <label htmlFor="isActive" className="theme-copy">Active</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton type="button" onClick={handleCloseModal} variant="secondary">Cancel</GlassButton>
            <GlassButton type="submit" disabled={submitting || (!imageFile && !editingBanner?.imageUrl)}>
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : editingBanner ? 'Update' : 'Create'
              }
            </GlassButton>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
}
