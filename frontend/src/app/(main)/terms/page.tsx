import { Shield, FileText, ChevronRight, MessageSquare, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "Terms of Service | PanneiStore",
  description: "Terms of Service for PanneiStore, Myanmar's #1 MLBB Marketplace",
};

export default function TermsOfServicePage() {
  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1 text-4xl opacity-80 drop-shadow-[0_0_15px_rgba(255,46,147,0.5)]">📜</div>
          <div className="diamond-float d2 text-3xl opacity-80 drop-shadow-[0_0_15px_rgba(161,44,255,0.4)]">⚖️</div>
          <div className="diamond-float d3 text-4xl opacity-80 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">🛡️</div>
        </div>
        <h1 className="diamonds-title flex items-center justify-center gap-3">
          Terms of Service
        </h1>
        <p className="diamonds-subtitle">Please read these terms carefully before using PanneiStore.</p>
      </div>

      <div className="diamonds-body" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        
        {/* Section 1 */}
        <div className="diamonds-section">
          <h2 className="section-heading">
            <span className="step-num"><FileText size={18} /></span> Account Trading Rules
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>To maintain a safe and secure marketplace for Mobile Legends accounts, all users must adhere to the following trading rules:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">Escrow Only:</strong> All trades must go through our official escrow process. Conducting transactions outside the platform voids all security guarantees.</li>
              <li><strong className="theme-heading">Full Access Required:</strong> Sellers are required to provide full access (Email, Password, and Moonton bindings) to the buyer before funds are released.</li>
              <li><strong className="theme-heading">Verification:</strong> PanneiStore admins will verify the account details before proceeding with the handover process.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Gamepad2 size={18} /></span> Diamond Top-Up Policy
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>Our top-up service is designed to be instant, but certain conditions apply to all purchases:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">Non-Refundable:</strong> Diamond top-ups are strictly non-refundable once the transaction is completed on the server.</li>
              <li><strong className="theme-heading">Accuracy of Information:</strong> You are fully responsible for ensuring your User ID and Zone ID are correct. We cannot refund or reverse diamonds sent to the wrong ID.</li>
              <li><strong className="theme-heading">Processing Times:</strong> Orders typically complete within 1-5 minutes, but may experience slight delays during official game maintenance or server overloads.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Shield size={18} /></span> User Conduct
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>We enforce a strict zero-tolerance policy against malicious behavior:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Scams, fraud, or any attempts to bypass the PanneiStore escrow system will result in an immediate and permanent ban.</li>
              <li>Treat all buyers, sellers, and our support staff with respect. Harassment will not be tolerated.</li>
              <li>Providing fake proof of payment or attempting chargeback fraud will lead to legal action and a permanent ban.</li>
            </ul>
            <p className="mt-6 text-brand-pink font-semibold">
              By using PanneiStore, you agree to abide by these rules to help keep our community safe.
            </p>
          </div>
        </div>

        {/* Section 4 / Contact */}
        <div className="diamonds-section mt-12 mb-8">
          <h2 className="section-heading">
            <span className="step-num"><MessageSquare size={18} /></span> Questions about these terms?
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-6 pl-2 md:pl-12">
            <p>
              If you have any questions regarding our Terms of Service or need clarification on our trading rules, please contact our administrative team.
            </p>
            <div>
              <a 
                href="https://t.me/Panneisan2002" 
                target="_blank" 
                rel="noreferrer"
                className="hero-cta hero-cta-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px]"
              >
                <MessageSquare size={16} className="fill-brand-pink/20" /> Contact Support on Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-24 pt-12 border-t border-[var(--card-border)]/50">
          <p className="theme-muted text-[14px]">
            Last updated on <span className="font-medium theme-heading">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
