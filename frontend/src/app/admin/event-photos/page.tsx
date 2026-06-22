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

interface EventPhoto {
  id: string;
  title: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function EventPhotosPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? '';
  const { toast, success, error: toastError } = useToast();
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<EventPhoto | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    displayOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const data = await adminFetch("/event-photos", { token });
      setPhotos(data.data as EventPhoto[]);
    } catch (error) {
      console.error("Failed to fetch event photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (photo?: EventPhoto) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title,
        displayOrder: photo.displayOrder,
        isActive: photo.isActive,
      });
      setImagePreview(photo.imageUrl);
    } else {
      setEditingPhoto(null);
      setFormData({ title: "", displayOrder: 0, isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPhoto(null);
    setFormData({ title: "", displayOrder: 0, isActive: true });
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
      formDataToSend.append("displayOrder", formData.displayOrder.toString());
      formDataToSend.append("isActive", formData.isActive.toString());
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const url = editingPhoto ? `/event-photos/${editingPhoto.id}` : "/event-photos";
      const method = editingPhoto ? "PUT" : "POST";

      const data = await adminFetch(url, {
        token,
        method,
        body: formDataToSend,
      });

      if (data.success) {
        fetchPhotos();
        handleCloseModal();
        success(editingPhoto ? 'Photo updated!' : 'Photo added successfully!');
      } else {
        toastError(data.message || "Failed to save event photo");
      }
    } catch (error) {
      console.error("Failed to save event photo:", error);
      toastError("Failed to save event photo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event photo?")) return;
    try {
      const data = await adminFetch(`/event-photos/${id}`, { token, method: "DELETE" });
      if (data.success) {
        fetchPhotos();
        success('Photo deleted.');
      } else {
        toastError(data.message || "Failed to delete");
      }
    } catch (error) {
      toastError("Failed to delete event photo");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const data = await adminFetch(`/event-photos/${id}/toggle`, {
        token,
        method: "PATCH",
      });
      if (data.success) {
        fetchPhotos();
      }
    } catch (error) {
      console.error("Failed to toggle event photo status:", error);
    }
  };

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    const photoIndex = photos.findIndex((p) => p.id === id);
    const newOrder = direction === "up" ? photos[photoIndex].displayOrder - 1 : photos[photoIndex].displayOrder + 1;

    try {
      const data = await adminFetch(`/event-photos/${id}`, {
        token,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      if (data.success) {
        fetchPhotos();
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
          <p className="theme-copy">Loading event photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastNotification toast={toast} />
      <div className="admin-page-header">
        <div>
          <h2>Event Photos</h2>
          <p>Manage hero showcase event photos</p>
        </div>
        <GlassButton onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} />
          Add Photo
        </GlassButton>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-16 border theme-soft-border rounded-2xl">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="theme-copy text-lg mb-4">No event photos found</p>
          <GlassButton onClick={() => handleOpenModal()}>Add Your First Photo</GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border theme-soft-border relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                {!photo.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold uppercase tracking-wider">Inactive</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="theme-heading font-semibold">{photo.title}</h3>
                  <p className="text-xs theme-copy">Order: {photo.displayOrder}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMoveOrder(photo.id, "up")} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Move Up">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handleMoveOrder(photo.id, "down")} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Move Down">
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={() => handleToggleActive(photo.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={photo.isActive ? "Deactivate" : "Activate"}>
                    {photo.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => handleOpenModal(photo)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(photo.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatedModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPhoto ? "Edit Event Photo" : "Add Event Photo"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block theme-copy text-sm font-semibold mb-2">Title</label>
            <GlassInput
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Event photo title"
            />
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-2">Image</label>
            <div className="border-2 border-dashed theme-soft-border rounded-xl p-6 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="theme-copy mb-2">Click to upload or drag and drop</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="inline-block px-4 py-2 bg-brand-pink text-white rounded-lg cursor-pointer hover:bg-brand-pink/90 transition-colors">
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block theme-copy text-sm font-semibold mb-2">Display Order</label>
            <GlassInput
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
            <label htmlFor="isActive" className="theme-copy">Active</label>
          </div>

          <div className="flex gap-3 pt-4">
            <GlassButton type="button" onClick={handleCloseModal} variant="secondary">Cancel</GlassButton>
            <GlassButton type="submit" disabled={submitting || (!imageFile && !editingPhoto)}>
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                : editingPhoto ? 'Update' : 'Create'
              }
            </GlassButton>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
}
