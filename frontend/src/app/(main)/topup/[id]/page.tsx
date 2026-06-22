"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft, Check, Shield, Zap, Star,
  ShoppingCart, User, Layers, X,
} from "lucide-react";
import { cn } from "@/utils/cn";

/* ─── Types ─────────────────────────────────────────────────────── */
interface Game { id: string; name: string; logo: string | null }
interface TopupPackage { id: string; packageName: string; price: number; category: string }

/* ─── Icon resolver ─────────────────────────────────────────────── */
const getPkgIcon = (pkg: TopupPackage): string => {
  const cat = pkg.category;
  const name = pkg.packageName.toLowerCase();

  // Named bundle types — exact match first
  if (name.includes("epic bundle") || name.includes("epic")) return "/diamonds/EpicBundle.png";
  if (name.includes("elite bundle") || name.includes("elite")) return "/diamonds/EliteBundle.png";
  if (name.includes("twilight")) return "/diamonds/TwilightPass.png";
  if (name.includes("starlight")) return "/diamonds/starlight.png";
  if (cat === "Weekly Pass" || name.includes("weekly") || name.includes("pass"))
    return "/diamonds/weeklypass.png";

  // 2x bundles (50+50, 150+150, etc.)
  if (name.includes("+")) {
    const n = parseInt(name.match(/^(\d+)/)?.[1] ?? "0");
    if (n <= 100) return "/diamonds/d-small.png";
    if (n <= 300) return "/diamonds/d-medium.png";
    return "/diamonds/d-large.png";
  }

  // Regular diamonds — scale by amount
  const n = parseInt(name.match(/^(\d+)/)?.[1] ?? "0");
  if (n <= 22) return "/diamonds/d-tiny.png";
  if (n <= 100) return "/diamonds/d-small.png";
  if (n <= 400) return "/diamonds/d-medium.png";
  if (n <= 800) return "/diamonds/d-large.png";
  if (n <= 2000) return "/diamonds/d-xlarge.png";
  if (n <= 5000) return "/diamonds/d-xxlarge.png";
  return "/diamonds/d-mega.png";
};

/* ─── Section grouping logic ────────────────────────────────────── */
const sectionOf = (pkg: TopupPackage): "2x" | "pass" | "diamonds" => {
  const name = pkg.packageName.toLowerCase();
  const cat = pkg.category;
  // 2x Diamonds: packageName contains "+" pattern like "50+50"
  if (/\d+\+\d+/.test(pkg.packageName)) return "2x";
  // Pass/Starlight/Twilight/Bundles → Mobile Legends Pass
  if (
    cat === "Weekly Pass" || cat === "Starlight" ||
    cat === "Twilight Pass" || cat === "Bundles" ||
    name.includes("pass") || name.includes("bundle") ||
    name.includes("elite") || name.includes("epic") || name.includes("monthly")
  ) return "pass";
  return "diamonds";
};

const PAYMENTS = [
  { id: "KBZ Pay", logo: "/payments/kbz.png" },
  { id: "Wave Pay", logo: "/payments/wave.png" },
  { id: "AYA Pay", logo: "/payments/aya.png" },
  { id: "Manual Transfer", logo: "/payments/manual.png" },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function GameTopUpPage() {
  const { id } = useParams();

  const [game, setGame] = useState<Game | null>(null);
  const [pkgs, setPkgs] = useState<TopupPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selPkg, setSelPkg] = useState<TopupPackage | null>(null);
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [payment, setPayment] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [g, p] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/topup-packages/game/${id}`),
        ]);
        setGame(g.data.data);
        setPkgs(p.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleOrder = () => {
    if (!selPkg) return;
    const msg = encodeURIComponent(
      `🎮 Top Up Order\nGame: ${game?.name}\nPackage: ${selPkg.packageName}\nPrice: ${selPkg.price.toLocaleString()} MMK\nUser ID: ${userId} (Zone: ${serverId})\nPayment: ${payment}\n\nPlease send payment screenshot after payment.`
    );
    window.open(`https://t.me/panneisan2002?text=${msg}`, "_blank");
  };

  const canOrder = selPkg && userId && serverId && payment;

  // Group packages into sections
  const twoDiamonds = pkgs.filter(p => sectionOf(p) === "2x");
  const passPkgs = pkgs.filter(p => sectionOf(p) === "pass");
  const diamondPkgs = pkgs.filter(p => sectionOf(p) === "diamonds");

  // Debug: log package counts
  console.log("Total packages:", pkgs.length);
  console.log("2x Diamonds:", twoDiamonds.length);
  console.log("Pass packages:", passPkgs.length);
  console.log("Diamond packages:", diamondPkgs.length);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full bg-brand-pink/20 animate-ping" />
            <div className="relative w-14 h-14 glass-panel rounded-full flex items-center justify-center">
              <img src="/diamonds/d-large.png" alt="" className="w-8 h-8 object-contain animate-bounce" />
            </div>
          </div>
          <p className="theme-muted text-sm font-medium">Loading packages…</p>
        </div>
      </div>
    );
  }

  /* ── Page ── */
  return (
    <>
      <div className="w-full flex justify-center py-6 pb-32 px-4">
        <div className="w-full max-w-4xl">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link href="/topup">
              <button className="group flex items-center gap-2 theme-muted hover:text-brand-pink transition-colors text-sm font-semibold">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Games
              </button>
            </Link>
          </motion.div>

          {/* ── Game Header ── */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-brand-pink via-brand-purple to-brand-cyan" />
              <div className="p-5 sm:p-8 flex flex-col items-center text-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl blur-xl bg-gradient-to-br from-brand-pink/40 to-brand-purple/40" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden glass-panel flex items-center justify-center border border-brand-pink/20">
                    <img
                      src="/gamelogo/mobilelegends.png"
                      alt={game?.name ?? "Mobile Legends"}
                      className="w-full h-full object-contain p-1.5"
                      onError={e => {
                        if (game?.logo) (e.currentTarget as HTMLImageElement).src = game.logo;
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col items-center">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black theme-heading truncate w-full text-center">{game?.name}</h1>
                  <p className="theme-muted text-sm sm:text-base mt-2 mb-5">Choose a package below to get started</p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {[
                      { icon: <Zap size={12} fill="currentColor" />, label: "Instant", cls: "text-brand-pink   bg-brand-pink/10   border-brand-pink/25" },
                      { icon: <Shield size={12} />, label: "Secure", cls: "text-brand-purple bg-brand-purple/10 border-brand-purple/25" },
                      { icon: <Star size={12} fill="currentColor" />, label: "Best Price", cls: "text-brand-cyan   bg-brand-cyan/10   border-brand-cyan/25" },
                    ].map(b => (
                      <span key={b.label} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border", b.cls)}>
                        {b.icon}{b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Main: package sections ── */}
          <div className="space-y-24">

            {/* 2x Diamonds */}
            {twoDiamonds.length > 0 && (
              <PackageSection title="2x Diamonds" accent="#ff2e93" packages={twoDiamonds} selPkg={selPkg} onSelect={setSelPkg} />
            )}

            {/* Mobile Legends Pass */}
            {passPkgs.length > 0 && (
              <PackageSection title="Mobile Legends Pass" accent="#10b981" packages={passPkgs} selPkg={selPkg} onSelect={setSelPkg} />
            )}

            {/* Diamond List */}
            {diamondPkgs.length > 0 && (
              <PackageSection title="Diamond List" accent="#a12cff" packages={diamondPkgs} selPkg={selPkg} onSelect={setSelPkg} />
            )}

            {/* Fallback: Show all packages if none are categorized */}
            {twoDiamonds.length === 0 && passPkgs.length === 0 && diamondPkgs.length === 0 && pkgs.length > 0 && (
              <PackageSection title="All Packages" accent="#a12cff" packages={pkgs} selPkg={selPkg} onSelect={setSelPkg} />
            )}

            {pkgs.length === 0 && (
              <div className="flex flex-col items-center py-20 theme-muted">
                <img src="/diamonds/d-large.png" alt="" className="w-16 h-16 object-contain opacity-30 mb-4" />
                <p className="text-sm">No packages available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ DESKTOP: Centered popup modal ══ */}
      <AnimatePresence>
        {selPkg && (
          <>
            <motion.div
              key="desktop-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="hidden lg:block fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
              onClick={() => setSelPkg(null)}
            />
            <motion.div
              key="desktop-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-6 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-lg">
                <CheckoutCard
                  pkg={selPkg}
                  userId={userId} setUserId={setUserId}
                  serverId={serverId} setServerId={setServerId}
                  payment={payment} setPayment={setPayment}
                  canOrder={!!canOrder}
                  onOrder={handleOrder}
                  onClose={() => setSelPkg(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ MOBILE: Bottom sheet ══ */}
      <AnimatePresence>
        {selPkg && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelPkg(null)}
            />
            <motion.div
              key="mobile-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto"
              style={{ borderRadius: "24px 24px 0 0", scrollbarWidth: "none" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-3 sticky top-0 z-10"
                style={{ background: "var(--card)", borderRadius: "24px 24px 0 0" }}>
                <div className="w-10 h-1 rounded-full bg-brand-pink/30" />
              </div>
              <CheckoutCard
                pkg={selPkg}
                userId={userId} setUserId={setUserId}
                serverId={serverId} setServerId={setServerId}
                payment={payment} setPayment={setPayment}
                canOrder={!!canOrder}
                onOrder={handleOrder}
                onClose={() => setSelPkg(null)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Package Section ──────────────────────────────────────────── */
function PackageSection({
  title, accent, packages, selPkg, onSelect,
}: {
  title: string;
  accent: string;
  packages: TopupPackage[];
  selPkg: TopupPackage | null;
  onSelect: (p: TopupPackage | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
    >
      {/* Section header: decorative divider + pill label + title */}
      <div className="flex flex-col items-center gap-4 mb-10">
        {/* Decorative line */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}55)` }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${accent}55)` }} />
        </div>
        {/* Large section title */}
        <h2
          className="text-2xl sm:text-3xl font-black text-center"
          style={{ color: accent }}
        >
          {title}
        </h2>
      </div>

      {/* Package grid */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
        {packages.map((pkg, i) => (
          <PkgCard key={pkg.id} pkg={pkg} accent={accent} index={i}
            isSelected={selPkg?.id === pkg.id}
            onSelect={() => onSelect(selPkg?.id === pkg.id ? null : pkg)}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Individual package card ───────────────────────────────────── */
function PkgCard({ pkg, accent, index, isSelected, onSelect }: {
  pkg: TopupPackage; accent: string; index: number;
  isSelected: boolean; onSelect: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="relative w-[160px] sm:w-[180px] md:w-[195px] lg:w-[210px] flex-shrink-0 text-left flex flex-col rounded-[22px] overflow-hidden transition-all duration-200"
      style={{
        background: "var(--card)",
        border: isSelected ? `2px solid ${accent}` : "2px solid var(--card-border)",
        boxShadow: isSelected
          ? `0 8px 24px ${accent}28, 0 2px 8px rgba(0,0,0,0.08)`
          : "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Image zone ── */}
      <div
        className="relative flex items-center justify-center pt-7 pb-4 px-4"
        style={{
          background: isSelected
            ? `linear-gradient(160deg,${accent}12,${accent}06)`
            : "linear-gradient(160deg,rgba(0,180,255,0.05),transparent)",
          borderBottom: `1px solid ${isSelected ? accent + "22" : "var(--card-border)"}`,
          minHeight: 120,
        }}
      >
        {/* Subtle glow behind icon */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 70%,${accent}18,transparent 70%)` }}
        />

        {/* ⚡ Instant Delivery — top left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          <Zap size={9} style={{ color: accent }} fill={accent} />
          <span className="text-[9px] font-extrabold" style={{ color: accent }}>Instant</span>
        </div>

        {/* Selected check — top right */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: accent }}
            >
              <Check size={13} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Package icon */}
        <img
          src={getPkgIcon(pkg)}
          alt={pkg.packageName}
          className="relative w-auto object-contain z-10 transition-transform duration-200"
          style={{
            height: "clamp(52px, 12vw, 72px)",
            filter: `drop-shadow(0 6px 14px rgba(0,160,255,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))`,
          }}
        />
      </div>

      {/* ── Info zone ── */}
      <div className="flex flex-col flex-1 px-3 pt-3 pb-3 gap-1 items-center text-center">
        <p className="text-xs sm:text-[13px] font-black theme-heading leading-snug">
          {pkg.packageName}
        </p>

        {/* Price pill */}
        <div
          className="mt-1.5 px-3 py-1 rounded-full inline-flex items-baseline gap-1"
          style={{
            background: `${accent}14`,
            border: `1px solid ${accent}30`,
          }}
        >
          <span className="text-sm sm:text-base font-black leading-none" style={{ color: accent }}>
            {pkg.price.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold" style={{ color: accent, opacity: 0.7 }}>MMK</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Checkout Card ────────────────────────────────────────────── */
function CheckoutCard({
  pkg, userId, setUserId, serverId, setServerId,
  payment, setPayment, canOrder, onOrder, onClose, isMobile,
}: {
  pkg: TopupPackage;
  userId: string; setUserId: (v: string) => void;
  serverId: string; setServerId: (v: string) => void;
  payment: string; setPayment: (v: string) => void;
  canOrder: boolean; onOrder: () => void; onClose: () => void;
  isMobile?: boolean;
}) {
  const sectionAccent =
    sectionOf(pkg) === "2x" ? "#ff2e93" :
      sectionOf(pkg) === "pass" ? "#10b981" : "#a12cff";

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "var(--card)",
        borderRadius: isMobile ? "0" : "28px",
        border: isMobile ? "none" : "1px solid var(--card-border)",
        boxShadow: isMobile ? "none" : "0 24px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top accent bar */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${sectionAccent}, #a12cff)` }} />

      <div className="p-5 sm:p-6 space-y-4">

        {/* Selected package summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                style={{ background: `linear-gradient(135deg,${sectionAccent},#a12cff)` }} />
              <img
                src={getPkgIcon(pkg)}
                alt={pkg.packageName}
                className="relative w-12 h-12 object-contain"
                style={{ filter: "drop-shadow(0 4px 10px rgba(0,180,255,0.35))" }}
              />
            </div>
            <div className="min-w-0">
              <p className="theme-heading font-black text-sm leading-snug truncate">{pkg.packageName}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-black text-xl leading-none" style={{ color: sectionAccent }}>
                  {pkg.price.toLocaleString()}
                </span>
                <span className="text-xs font-bold theme-muted">MMK</span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center theme-muted hover:text-brand-pink transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Account inputs */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid var(--card-border)", background: "var(--card)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: `${sectionAccent}0f`, borderBottom: `1px solid ${sectionAccent}22` }}>
            <User size={12} style={{ color: sectionAccent }} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: sectionAccent }}>
              Game Account
            </span>
          </div>
          <div className="p-3 space-y-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1.5 px-0.5">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="e.g. 123456789"
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold theme-heading outline-none transition-all duration-200"
                style={{ background: "var(--background)", border: "1.5px solid var(--card-border)", color: "var(--foreground)" }}
                onFocus={e => { e.currentTarget.style.borderColor = sectionAccent; e.currentTarget.style.boxShadow = `0 0 0 3px ${sectionAccent}18`; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider theme-muted mb-1.5 px-0.5">
                Zone ID <span className="normal-case font-medium">(Server)</span>
              </label>
              <input
                type="text"
                value={serverId}
                onChange={e => setServerId(e.target.value)}
                placeholder="e.g. 2501"
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold theme-heading outline-none transition-all duration-200"
                style={{ background: "var(--background)", border: "1.5px solid var(--card-border)", color: "var(--foreground)" }}
                onFocus={e => { e.currentTarget.style.borderColor = sectionAccent; e.currentTarget.style.boxShadow = `0 0 0 3px ${sectionAccent}18`; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <p className="text-[11px] theme-muted leading-relaxed px-0.5">
              💡 Open ML → <strong className="theme-heading">Avatar</strong> → <strong className="theme-heading">Basic Info</strong>
            </p>
          </div>
        </div>

        {/* Payment method — 2×2 card grid */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <ShoppingCart size={12} style={{ color: sectionAccent }} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: sectionAccent }}>
              Payment Method
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PAYMENTS.map(m => {
              const sel = payment === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className="relative flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl transition-all duration-200 overflow-hidden"
                  style={{
                    border: sel ? `2px solid ${sectionAccent}` : "2px solid var(--card-border)",
                    background: sel ? `${sectionAccent}0c` : "var(--background)",
                    boxShadow: sel ? `0 4px 16px ${sectionAccent}22` : "none",
                  }}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center"
                    style={{ background: "var(--card)" }}>
                    <img src={m.logo} alt={m.id} className="w-full h-full object-contain p-1" />
                  </div>
                  <span className={cn("text-[11px] font-bold text-center leading-tight transition-colors",
                    sel ? "text-brand-pink" : "theme-heading")}>
                    {m.id}
                  </span>
                  {sel && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: sectionAccent }}>
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: canOrder ? 1.015 : 1 }}
          whileTap={{ scale: canOrder ? 0.985 : 1 }}
          onClick={onOrder}
          disabled={!canOrder}
          className="liquid-glass-btn w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-white text-sm disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ShoppingCart size={17} />
          Place Order — {pkg.price.toLocaleString()} MMK
        </motion.button>

        {!canOrder && (
          <p className="text-[11px] theme-muted text-center -mt-1">
            {!userId || !serverId ? "Enter your User ID and Zone ID above" : "Please select a payment method"}
          </p>
        )}
      </div>
    </div>
  );
}
