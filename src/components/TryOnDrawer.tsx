import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { formatInr } from '../data/catalog';
import {
  ActiveOrder,
  BagItem,
  CustomerCheckoutInfo,
  HubLocation,
  OrderStage,
  TrialDecision,
} from '../types/store';
import { ResilientImage } from './ResilientImage';

interface TryOnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hub: HubLocation;
  bagItems: BagItem[];
  onUpdateQty: (lineId: string, delta: number) => void;
  onRemoveItem: (lineId: string) => void;
  activeOrder: ActiveOrder | null;
  onPlaceOrder: (customer: CustomerCheckoutInfo) => void;
  onAdvanceOrderStage: () => void;
  onToggleTrialDecision: (lineId: string, decision: TrialDecision) => void;
  onStartSampleTrial: () => void;
  onResetOrder: () => void;
}

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function TryOnDrawer({
  isOpen,
  onClose,
  hub,
  bagItems,
  onUpdateQty,
  onRemoveItem,
  activeOrder,
  onPlaceOrder,
  onAdvanceOrderStage,
  onToggleTrialDecision,
  onStartSampleTrial,
  onResetOrder,
}: TryOnDrawerProps) {
  const [viewMode, setViewMode] = useState<'bag' | 'trial'>(activeOrder ? 'trial' : 'bag');
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);
  const [fullName, setFullName] = useState('Aarav Mehta');
  const [phone, setPhone] = useState('+91 98450 21890');
  const [address, setAddress] = useState('42, 12th Main Road, HAL 2nd Stage');
  const [pincode, setPincode] = useState(hub.pincode);
  const [paymentMode, setPaymentMode] = useState<'try_and_buy' | 'cod_upi'>('try_and_buy');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setPincode(hub.pincode);
  }, [hub.pincode]);

  useEffect(() => {
    if (activeOrder) {
      setViewMode('trial');
      setShowCheckoutForm(false);
    } else {
      setViewMode('bag');
    }
  }, [activeOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bagSubtotal = bagItems.reduce(
    (sum, item) => sum + item.product.priceInr * item.quantity,
    0
  );
  const totalPieceCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeDispatchThreshold = 1999;
  const deliveryFee = bagSubtotal >= freeDispatchThreshold || bagSubtotal === 0 ? 0 : 99;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setFormError('Please complete all delivery fields so our rider can reach you.');
      return;
    }
    setFormError('');
    onPlaceOrder({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      paymentMode,
    });
  };

  // Calculations for Active Trial Order
  const keptTotal = activeOrder
    ? activeOrder.items
        .filter((item) => item.decision === TrialDecision.RETAIN)
        .reduce((sum, item) => sum + item.product.priceInr * item.quantity, 0)
    : 0;
  const returnedCount = activeOrder
    ? activeOrder.items
        .filter((item) => item.decision === TrialDecision.RETURN)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const keptCount = activeOrder
    ? activeOrder.items
        .filter((item) => item.decision === TrialDecision.RETAIN)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#131B2E]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Try-On Bag and Doorstep Trial"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-lg h-full bg-[#FBFBFA] border-l border-[#E4E4DE] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E4E4DE] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-[#131B2E] truncate">
              {viewMode === 'trial' && activeOrder
                ? `Order ${activeOrder.orderNumber}`
                : 'Try-On Bag'}
            </h2>
            <p className="text-xs text-[#6E757C] mt-0.5 truncate">
              {hub.name} · <span className="font-mono tabular-nums">{hub.etaMinutes} min</span>{' '}
              dispatch
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeOrder && (
              <div className="flex items-center p-1 bg-[#F4F4F0] border border-[#E4E4DE] rounded">
                <button
                  type="button"
                  onClick={() => setViewMode('bag')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                    viewMode === 'bag'
                      ? 'bg-white text-[#131B2E] shadow-xs'
                      : 'text-[#6E757C] hover:text-[#131B2E]'
                  }`}
                >
                  Bag ({totalPieceCount})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('trial')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                    viewMode === 'trial'
                      ? 'bg-[#0D35F3] text-white'
                      : 'text-[#6E757C] hover:text-[#131B2E]'
                  }`}
                >
                  Live Trial
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-10 h-10 flex items-center justify-center rounded border border-[#E4E4DE] bg-white text-[#131B2E] hover:bg-[#F4F4F0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {viewMode === 'trial' && activeOrder ? (
            <>
              {/* Order Stage Banner */}
              <div className="p-4 rounded bg-[#131B2E] text-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#D2D9F4]">
                    <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{activeOrder.stage}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#C3F400]">
                    {activeOrder.stage === OrderStage.DOORSTEP_TRIAL
                      ? `Trial ${formatCountdown(activeOrder.trialSecondsRemaining)}`
                      : activeOrder.stage === OrderStage.COMPLETED
                      ? 'Closed'
                      : `ETA ${activeOrder.etaMinutesRemaining} min`}
                  </span>
                </div>

                {activeOrder.stage === OrderStage.DOORSTEP_TRIAL ? (
                  <div>
                    <p className="text-sm font-medium text-white">
                      Rider {activeOrder.riderName} is waiting nearby.
                    </p>
                    <p className="text-xs text-[#C5C6CB] mt-1 leading-relaxed">
                      Try every garment on at home. Mark what you want to keep or return to the rider with zero repackaging.
                    </p>
                  </div>
                ) : activeOrder.stage === OrderStage.COMPLETED ? (
                  <div>
                    <p className="text-sm font-medium text-white">
                      Doorstep handover completed with {activeOrder.riderName}.
                    </p>
                    <p className="text-xs text-[#C5C6CB] mt-1">
                      Only kept garments were billed. Returned pieces are back in transit to {activeOrder.hub.name}.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-[#C5C6CB]">
                      Rider: {activeOrder.riderName} · {activeOrder.hub.name}
                    </p>
                    <button
                      type="button"
                      onClick={onAdvanceOrderStage}
                      className="px-3 py-1.5 rounded bg-white text-[#131B2E] text-xs font-semibold hover:bg-[#F4F4F0] transition-colors whitespace-nowrap shrink-0"
                    >
                      {activeOrder.stage === OrderStage.PACKING
                        ? 'Dispatch Rider'
                        : 'Mark Delivered (Start 40m Trial)'}
                    </button>
                  </div>
                )}
              </div>

              {/* Address & Payment Summary */}
              <div className="p-4 rounded bg-[#F4F4F0] border border-[#E4E4DE] flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#131B2E]">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{activeOrder.customer.fullName}</span>
                  </div>
                  <p className="text-[#444657]">
                    {activeOrder.customer.address}, {activeOrder.customer.pincode}
                  </p>
                  <p className="font-mono text-[#6E757C]">{activeOrder.customer.phone}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#6E757C] block">Placed</span>
                  <span className="font-mono text-[#131B2E] font-medium">
                    {activeOrder.placedAtLabel}
                  </span>
                </div>
              </div>

              {/* Doorstep Item Keep / Return Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#131B2E]">
                    Garments in Delivery ({activeOrder.items.length})
                  </h3>
                  {activeOrder.stage === OrderStage.DOORSTEP_TRIAL && (
                    <span className="text-xs text-[#6E757C]">Select Keep or Return</span>
                  )}
                </div>

                {activeOrder.items.map((item) => {
                  const isKept = item.decision === TrialDecision.RETAIN;
                  return (
                    <div
                      key={item.lineId}
                      className="p-3.5 rounded bg-white border border-[#E4E4DE] flex gap-3.5 items-start"
                    >
                      <div className="w-16 aspect-[3/4] rounded-sm overflow-hidden bg-[#F4F4F0] shrink-0">
                        <ResilientImage
                          src={item.product.image}
                          alt={item.product.title}
                          fallbackLabel={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-[#6E757C] truncate">
                              {item.product.brand} · Size{' '}
                              <span className="font-mono font-semibold text-[#131B2E]">
                                {item.size}
                              </span>
                              {item.isBackupTrialSize ? ' · Backup Trial' : ''}
                            </p>
                            <p className="text-sm font-semibold text-[#131B2E] truncate">
                              {item.product.title}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold tabular-nums text-[#131B2E] shrink-0">
                            {isKept ? formatInr(item.product.priceInr * item.quantity) : '₹0'}
                          </span>
                        </div>

                        {activeOrder.stage === OrderStage.DOORSTEP_TRIAL ? (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                onToggleTrialDecision(item.lineId, TrialDecision.RETAIN)
                              }
                              className={`h-9 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap ${
                                isKept
                                  ? 'bg-[#0D35F3] border-[#0D35F3] text-white'
                                  : 'bg-white border-[#E4E4DE] text-[#444657] hover:border-[#131B2E]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Keep Item</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onToggleTrialDecision(item.lineId, TrialDecision.RETURN)
                              }
                              className={`h-9 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap ${
                                !isKept
                                  ? 'bg-[#D92D20] border-[#D92D20] text-white'
                                  : 'bg-white border-[#E4E4DE] text-[#444657] hover:border-[#131B2E]'
                              }`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Return to Rider</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs font-medium flex items-center gap-1.5">
                            {isKept ? (
                              <span className="text-[#0D35F3] inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                Retained ({item.quantity})
                              </span>
                            ) : (
                              <span className="text-[#D92D20] inline-flex items-center gap-1">
                                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                Returned to Rider ({item.quantity})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : bagItems.length === 0 ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded bg-[#F4F4F0] border border-[#E4E4DE] flex items-center justify-center text-[#6E757C]">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-xs mx-auto">
                <h3 className="font-display text-lg font-bold text-[#131B2E]">
                  Your Try-On Bag is empty
                </h3>
                <p className="text-xs text-[#6E757C] leading-relaxed">
                  Add garments in up to two sizes for 30-minute dispatch, or launch a sample doorstep trial to inspect the rider handover flow.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded border border-[#131B2E] text-xs font-semibold text-[#131B2E] hover:bg-[#F4F4F0] transition-colors whitespace-nowrap"
                >
                  Browse Collection
                </button>
                <button
                  type="button"
                  onClick={onStartSampleTrial}
                  className="px-4 py-2.5 rounded bg-[#0D35F3] text-white text-xs font-semibold hover:bg-[#0023BB] transition-colors whitespace-nowrap"
                >
                  Preview Live Doorstep Trial
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Bag Items */}
              <div className="space-y-3">
                {bagItems.map((item) => (
                  <div
                    key={item.lineId}
                    className="p-3.5 rounded bg-white border border-[#E4E4DE] flex gap-3.5 items-start"
                  >
                    <div className="w-16 aspect-[3/4] rounded-sm overflow-hidden bg-[#F4F4F0] shrink-0">
                      <ResilientImage
                        src={item.product.image}
                        alt={item.product.title}
                        fallbackLabel={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-[#6E757C] truncate">
                            {item.product.brand} · Size{' '}
                            <span className="font-mono font-semibold text-[#131B2E]">
                              {item.size}
                            </span>
                            {item.isBackupTrialSize ? ' · Backup Trial Size' : ''}
                          </p>
                          <p className="text-sm font-semibold text-[#131B2E] truncate">
                            {item.product.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.lineId)}
                          aria-label={`Remove ${item.product.title} size ${item.size}`}
                          className="p-1.5 text-[#6E757C] hover:text-[#D92D20] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="inline-flex items-center border border-[#E4E4DE] rounded bg-[#FBFBFA]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.lineId, -1)}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#131B2E] hover:bg-[#F4F4F0]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.lineId, 1)}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#131B2E] hover:bg-[#F4F4F0]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono text-sm font-semibold tabular-nums text-[#131B2E]">
                          {formatInr(item.product.priceInr * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery & COD / Try-and-Buy Verification Form */}
              {showCheckoutForm && (
                <form
                  id="checkout-form"
                  onSubmit={handleCheckoutSubmit}
                  className="p-4 rounded bg-[#F4F4F0] border border-[#E4E4DE] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#131B2E]">
                      Doorstep Dispatch Verification
                    </h3>
                    <span className="font-mono text-xs text-[#4A5D4E]">
                      Free above {formatInr(freeDispatchThreshold)}
                    </span>
                  </div>

                  {formError && (
                    <p className="text-xs text-[#D92D20] font-medium" role="alert">
                      {formError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#444657] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-10 px-3 rounded bg-white border border-[#E4E4DE] text-sm text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#444657] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded bg-white border border-[#E4E4DE] text-sm font-mono text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#444657] mb-1">
                        Street / Apartment
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-10 px-3 rounded bg-white border border-[#E4E4DE] text-sm text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#444657] mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full h-10 px-3 rounded bg-white border border-[#E4E4DE] text-sm font-mono text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-medium text-[#444657]">
                      Payment Preference
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('try_and_buy')}
                        className={`p-2.5 rounded border text-left text-xs transition-colors ${
                          paymentMode === 'try_and_buy'
                            ? 'border-[#0D35F3] bg-white text-[#131B2E]'
                            : 'border-[#E4E4DE] bg-[#FBFBFA] text-[#6E757C]'
                        }`}
                      >
                        <span className="font-semibold block text-[#131B2E]">
                          Try &amp; Buy (₹0 Upfront)
                        </span>
                        <span>Pay after 40-min trial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('cod_upi')}
                        className={`p-2.5 rounded border text-left text-xs transition-colors ${
                          paymentMode === 'cod_upi'
                            ? 'border-[#0D35F3] bg-white text-[#131B2E]'
                            : 'border-[#E4E4DE] bg-[#FBFBFA] text-[#6E757C]'
                        }`}
                      >
                        <span className="font-semibold block text-[#131B2E]">
                          Cash / UPI at Doorstep
                        </span>
                        <span>Settle directly with rider</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {viewMode === 'trial' && activeOrder ? (
          <div className="px-6 py-5 border-t border-[#E4E4DE] bg-[#F4F4F0] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6E757C]">
                <span>Retained Items ({keptCount})</span>
                <span className="font-mono tabular-nums text-[#131B2E] font-medium">
                  {formatInr(keptTotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#6E757C]">
                <span>Returned to Rider ({returnedCount})</span>
                <span className="font-mono tabular-nums text-[#4A5D4E]">₹0 billed</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#131B2E] pt-1.5 border-t border-[#E4E4DE]">
                <span>Final Payable Total</span>
                <span className="font-mono tabular-nums">{formatInr(keptTotal)}</span>
              </div>
            </div>

            {activeOrder.stage === OrderStage.DOORSTEP_TRIAL ? (
              <button
                type="button"
                onClick={onAdvanceOrderStage}
                className="w-full h-12 px-5 rounded bg-[#0D35F3] text-white text-sm font-semibold hover:bg-[#0023BB] transition-colors flex items-center justify-center gap-2"
              >
                <span>Confirm Handover &amp; Pay {formatInr(keptTotal)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : activeOrder.stage === OrderStage.COMPLETED ? (
              <button
                type="button"
                onClick={onResetOrder}
                className="w-full h-11 px-5 rounded border border-[#131B2E] bg-white text-[#131B2E] text-xs font-semibold hover:bg-[#F4F4F0] transition-colors"
              >
                Start Another Dispatch
              </button>
            ) : (
              <div className="flex items-center justify-between text-xs text-[#6E757C]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#131B2E]" aria-hidden="true" />
                  <span>40-min trial clock starts on rider arrival</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          bagItems.length > 0 && (
            <div className="px-6 py-5 border-t border-[#E4E4DE] bg-[#F4F4F0] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6E757C]">
                  <span>Try-On Bag Value ({totalPieceCount} items)</span>
                  <span className="font-mono tabular-nums text-[#131B2E]">
                    {formatInr(bagSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#6E757C]">
                  <span>{hub.etaMinutes}-Min Hub Dispatch</span>
                  <span className="font-mono tabular-nums text-[#4A5D4E]">
                    {deliveryFee === 0 ? 'Free' : formatInr(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#131B2E] pt-1.5 border-t border-[#E4E4DE]">
                  <span>Due Now (Try &amp; Buy)</span>
                  <span className="font-mono tabular-nums">
                    {showCheckoutForm && paymentMode === 'cod_upi'
                      ? `${formatInr(bagSubtotal + deliveryFee)} at door`
                      : '₹0 upfront'}
                  </span>
                </div>
              </div>

              {showCheckoutForm ? (
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full h-12 px-5 rounded bg-[#0D35F3] text-white text-sm font-semibold hover:bg-[#0023BB] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Dispatch Rider in {hub.etaMinutes} Mins</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full h-12 px-5 rounded bg-[#0D35F3] text-white text-sm font-semibold hover:bg-[#0023BB] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue to {hub.etaMinutes}-Min Dispatch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        )}
      </aside>
    </div>
  );
}
