'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Package {
  id: string;
  amount: number;
  bonusDiamonds: number;
  price: number;
  label?: string;
  isPopular: boolean;
  isBestValue: boolean;
}

interface Game {
  id: string;
  name: string;
  logo: string | null;
  status: string;
}

const PAYMENT_METHODS = [
  { id: 'KBZ_PAY', name: 'KBZ Pay', icon: '🏦', color: '#1976D2' },
  { id: 'WAVE_MONEY', name: 'Wave Money', icon: '🌊', color: '#FF6B00' },
  { id: 'AYA_PAY', name: 'AYA Pay', icon: '💳', color: '#E91E63' },
  { id: 'UAB_PAY', name: 'UAB Pay', icon: '🏧', color: '#9C27B0' },
  { id: 'MANUAL', name: 'Manual Transfer', icon: '📱', color: '#607D8B' },
];

export default function DiamondsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('KBZ_PAY');
  const [mlUserId, setMlUserId] = useState('');
  const [mlServerId, setMlServerId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<{ username: string } | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/diamonds/packages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPackages(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/games/active`);
      setGames(response.data.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setGamesLoading(false);
    }
  };

  const verifyPlayer = async () => {
    if (!mlUserId || !mlServerId) { setVerifyError('Please enter both User ID and Server ID'); return; }
    setVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diamonds/verify-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mlUserId, mlServerId }),
      });
      const data = await res.json();
      if (data.success) setVerified(data.data);
      else setVerifyError(data.message || 'Verification failed');
    } catch {
      setVerifyError('Could not connect to verification service');
    } finally {
      setVerifying(false);
    }
  };

  const handleOrder = async () => {
    if (!session) { router.push('/auth/login'); return; }
    if (!selected || !verified) return;
    setOrderLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({
          type: 'DIAMOND',
          diamondPackageId: selected,
          mlUserId, mlServerId,
          paymentGateway: paymentMethod,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/buyer/orders/${data.data.order.id}`);
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selected);

  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1">💎</div>
          <div className="diamond-float d2">💎</div>
          <div className="diamond-float d3">💎</div>
        </div>
        <h1 className="diamonds-title">
          Top Up
        </h1>
        <p className="diamonds-subtitle">Fast, Secure &amp; Trusted Top-Up Service</p>
      </div>

      <div className="diamonds-body">
        {/* Games Section */}
        <div className="diamonds-section">
          <h2 className="section-heading">
            <span className="step-num">🎮</span> Select Game
          </h2>
          
          {gamesLoading ? (
            <div className="packages-grid">
              {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-pkg" />)}
            </div>
          ) : games.length === 0 ? (
            <p className="theme-muted text-center py-8">No games available at the moment.</p>
          ) : (
            <div className="packages-grid">
              {games.map((game) => (
                <Link key={game.id} href={`/topup/${game.id}`}>
                  <div className="pkg-card">
                    <div className="w-full h-32 mb-4 flex items-center justify-center bg-gradient-to-br from-brand-pink/10 to-purple-500/10 rounded-xl overflow-hidden p-3">
                      <img
                        src={game.logo || "/gamelogo/mobilelegends.png"}
                        alt={game.name}
                        className="w-full h-full object-contain filter drop-shadow-md"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = "/gamelogo/mobilelegends.png";
                        }}
                      />
                    </div>
                    <div className="pkg-amount">{game.name}</div>
                    <div className="pkg-price">View Packages →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>



        {/* Step 3: Player Details */}
        {step !== 'select' && (
          <div className="diamonds-section">
            <h2 className="section-heading">
              <span className="step-num">3</span> Enter Player ID
            </h2>

            <div className="player-verify-card">
              <div className="player-id-row">
                <div className="form-group">
                  <label className="form-label">Mobile Legends User ID</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 123456789"
                    value={mlUserId}
                    onChange={(e) => { setMlUserId(e.target.value); setVerified(null); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Server ID</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 2501"
                    value={mlServerId}
                    onChange={(e) => { setMlServerId(e.target.value); setVerified(null); }}
                  />
                </div>
                <button
                  className="btn-verify"
                  onClick={verifyPlayer}
                  disabled={verifying}
                >
                  {verifying ? <span className="btn-spinner" /> : 'Verify'}
                </button>
              </div>

              {verifyError && <p className="verify-error">{verifyError}</p>}

              {verified && (
                <div className="verify-success">
                  <span>✅</span>
                  <div>
                    <strong>{verified.username}</strong>
                    <p>User ID: {mlUserId} | Server: {mlServerId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {verified && selectedPkg && (
          <div className="diamonds-section">
            <h2 className="section-heading">
              <span className="step-num">4</span> Choose Payment Method
            </h2>

            <div className="payment-methods-grid">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-btn ${paymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(method.id)}
                  style={{ '--method-color': method.color } as any}
                >
                  <span className="method-icon">{method.icon}</span>
                  <span className="method-name">{method.name}</span>
                </button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Diamond Package</span>
                <span>{selectedPkg.amount.toLocaleString()} 💎</span>
              </div>
              {selectedPkg.bonusDiamonds > 0 && (
                <div className="summary-row bonus">
                  <span>Bonus Diamonds</span>
                  <span>+{selectedPkg.bonusDiamonds} 💎</span>
                </div>
              )}
              <div className="summary-row">
                <span>Payment Method</span>
                <span>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>MMK {Number(selectedPkg.price).toLocaleString()}</span>
              </div>

              <button
                className="btn-primary btn-full btn-order"
                onClick={handleOrder}
                disabled={orderLoading}
              >
                {orderLoading ? <span className="btn-spinner" /> : `Place Order — MMK ${Number(selectedPkg.price).toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
