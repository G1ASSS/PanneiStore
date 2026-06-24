import { Shield, Lock, Eye, FileText, MessageSquare } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy | PanneiStore",
  description: "Privacy Policy for PanneiStore, Myanmar's #1 MLBB Marketplace",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1 text-brand-pink/60 drop-shadow-[0_0_15px_rgba(255,46,147,0.5)]"><Shield size={44} className="fill-brand-pink" strokeWidth={1.5} /></div>
          <div className="diamond-float d2 text-brand-purple/50 drop-shadow-[0_0_15px_rgba(161,44,255,0.4)]"><Lock size={36} className="fill-brand-purple" strokeWidth={1.5} /></div>
          <div className="diamond-float d3 text-brand-cyan/60 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]"><Eye size={40} className="fill-brand-cyan" strokeWidth={1.5} /></div>
        </div>
        <h1 className="diamonds-title flex items-center justify-center gap-3">
          Privacy Policy
        </h1>
        <p className="diamonds-subtitle">Your privacy and security are our top priorities.</p>
      </div>

      <div className="diamonds-body" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        
        {/* Section 1 */}
        <div className="diamonds-section">
          <h2 className="section-heading">
            <span className="step-num"><Eye size={18} /></span> Information We Collect
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>When you use PanneiStore to buy or sell Mobile Legends accounts, or to top up diamonds, we collect the necessary information to process your transactions securely:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">Account Information:</strong> Your name, email address, phone number, and PanneiStore account credentials.</li>
              <li><strong className="theme-heading">Game Data:</strong> Your Mobile Legends User ID and Server ID when purchasing diamond top-ups.</li>
              <li><strong className="theme-heading">Transaction Data:</strong> Details of your purchases, escrow agreements, and payment method identifiers.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Lock size={18} /></span> How We Protect Your Data
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>Security is the foundation of our escrow platform. We implement industry-standard security measures to ensure your data is safe:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All payment transactions are encrypted and processed through verified local payment gateways.</li>
              <li>We never store your full financial credentials or game account passwords directly on our servers without heavy encryption.</li>
              <li>Strict access controls are in place to ensure only authorized support staff can view your transaction details during a dispute.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><FileText size={18} /></span> How We Use Your Information
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>We only use your information to provide and improve our services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To facilitate secure account trading and diamond top-ups.</li>
              <li>To provide customer support and resolve escrow disputes via Telegram or our built-in ticketing system.</li>
              <li>To notify you about important updates, security alerts, and promotional offers.</li>
            </ul>
            <p className="mt-6 text-brand-pink font-semibold">
              We will never sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </div>
        </div>

        {/* Section 4 / Contact */}
        <div className="diamonds-section mt-12 mb-8">
          <h2 className="section-heading">
            <span className="step-num"><MessageSquare size={18} /></span> Questions about your privacy?
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-6 pl-2 md:pl-12">
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to reach out to our support team.
            </p>
            <div>
              <a 
                href="https://t.me/panneisan2002" 
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
