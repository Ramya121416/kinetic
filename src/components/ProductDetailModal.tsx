import { useEffect, useState } from 'react';
import { Check, Clock, ShieldCheck, X } from 'lucide-react';
import { formatInr } from '../data/catalog';
import { HubLocation, Product } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  hub: HubLocation;
  onClose: () => void;
  onAddToBag: (product: Product, primarySize: string, backupSize?: string) => void;
}

export function ProductDetailModal({
  product,
  hub,
  onClose,
  onAddToBag,
}: ProductDetailModalProps) {
  const firstAvailable =
    product?.sizes.find((s) => s.inHubCount > 0)?.size ?? product?.sizes[0]?.size ?? '';

  const [selectedSize, setSelectedSize] = useState<string>(firstAvailable);
  const [includeBackup, setIncludeBackup] = useState<boolean>(false);
  const [backupSize, setBackupSize] = useState<string>('');
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!product) return;
    const defaultSize =
      product.sizes.find((s) => s.inHubCount > 0)?.size ?? product.sizes[0]?.size ?? '';
    setSelectedSize(defaultSize);
    setIncludeBackup(false);
    const secondAvailable = product.sizes.find(
      (s) => s.inHubCount > 0 && s.size !== defaultSize
    )?.size;
    setBackupSize(secondAvailable ?? '');
    setJustAdded(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const availableOtherSizes = product.sizes.filter(
    (s) => s.inHubCount > 0 && s.size !== selectedSize
  );
  const canAddBackup = availableOtherSizes.length > 0;
  const activeSizeStock = product.sizes.find((s) => s.size === selectedSize);

  const handleSubmit = () => {
    if (!selectedSize || (activeSizeStock && activeSizeStock.inHubCount === 0)) return;
    const chosenBackup =
      includeBackup && backupSize && backupSize !== selectedSize ? backupSize : undefined;
    onAddToBag(product, selectedSize, chosenBackup);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 320);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131B2E]/45 backdrop-blur-xs p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FBFBFA] border border-[#E4E4DE] rounded-md shadow-2xl grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded bg-[#FBFBFA]/90 border border-[#E4E4DE] text-[#131B2E] hover:bg-[#F4F4F0] transition-colors focus-visible:outline-2 focus-visible:outline-[#0D35F3]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Sticky 3:4 Studio Image */}
        <div className="md:col-span-6 bg-[#F4F4F0] border-b md:border-b-0 md:border-r border-[#E4E4DE] flex items-center justify-center">
          <div className="w-full aspect-[3/4] overflow-hidden">
            <ResilientImage
              src={product.image}
              alt={`${product.brand} ${product.title}`}
              fallbackLabel={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E757C] pr-10">
              <span className="font-medium text-[#131B2E]">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#4A5D4E]">
                {hub.etaMinutes} min dispatch
              </span>
            </div>

            <div>
              <h2
                id="pdp-title"
                className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#131B2E] text-balance"
              >
                {product.title}
              </h2>
              <p className="mt-2 font-mono text-xl font-bold tabular-nums text-[#131B2E]">
                {formatInr(product.priceInr)}
              </p>
              <p className="mt-1 text-xs text-[#6E757C]">
                Pay only for what you keep after your 40-min doorstep trial.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[#444657]">{product.description}</p>

            {/* Primary Size Selector */}
            <div className="pt-2 border-t border-[#E4E4DE]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#131B2E]">
                  Select Size
                </span>
                <span className="text-xs font-mono tabular-nums text-[#6E757C]">
                  {activeSizeStock && activeSizeStock.inHubCount > 0
                    ? activeSizeStock.inHubCount === 1
                      ? `1 left in ${hub.name}`
                      : `${activeSizeStock.inHubCount} in hub`
                    : 'Out of hub stock'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const isAvailable = s.inHubCount > 0;
                  const isSelected = selectedSize === s.size;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(s.size);
                        if (backupSize === s.size) {
                          const alt = product.sizes.find(
                            (other) => other.inHubCount > 0 && other.size !== s.size
                          );
                          setBackupSize(alt?.size ?? '');
                        }
                      }}
                      className={`h-11 px-2 rounded border font-mono text-xs font-semibold tabular-nums transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0D35F3] ${
                        !isAvailable
                          ? 'border-[#E4E4DE] bg-[#F4F4F0] text-[#9CA3AF] line-through cursor-not-allowed'
                          : isSelected
                          ? 'border-[#0D35F3] bg-[#0D35F3] text-white'
                          : 'border-[#E4E4DE] bg-white text-[#131B2E] hover:border-[#131B2E]'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slikk-style Multi-Size Doorstep Trial Option */}
            {canAddBackup && (
              <div className="p-4 rounded bg-[#F4F4F0] border border-[#E4E4DE] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBackup}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setIncludeBackup(next);
                      if (next && (!backupSize || backupSize === selectedSize)) {
                        setBackupSize(availableOtherSizes[0]?.size ?? '');
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-[#0D35F3] rounded-sm"
                  />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold text-[#131B2E] block">
                      Bring a second size for doorstep trial (₹0 extra upfront)
                    </span>
                    <span className="text-[#6E757C]">
                      Try both sizes for 40 minutes at home and hand the spare straight back to the rider.
                    </span>
                  </div>
                </label>

                {includeBackup && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-medium text-[#6E757C] mr-1">Backup size:</span>
                    {availableOtherSizes.map((s) => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setBackupSize(s.size)}
                        className={`h-9 px-3 rounded border font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                          backupSize === s.size
                            ? 'border-[#131B2E] bg-[#131B2E] text-white'
                            : 'border-[#E4E4DE] bg-white text-[#131B2E] hover:border-[#131B2E]'
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fabric & Fit Specs */}
            <div className="pt-2 border-t border-[#E4E4DE] space-y-2 text-xs text-[#444657]">
              <div className="flex justify-between gap-4">
                <span className="text-[#6E757C] shrink-0">Material</span>
                <span className="text-right font-medium text-[#131B2E]">{product.fabric}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6E757C] shrink-0">Fit Guidance</span>
                <span className="text-right">{product.fitNote}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E4E4DE]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedSize || (activeSizeStock && activeSizeStock.inHubCount === 0)}
              className="w-full h-12 px-6 rounded bg-[#0D35F3] text-white text-sm font-semibold tracking-wide hover:bg-[#0023BB] disabled:bg-[#E4E4DE] disabled:text-[#6E757C] transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D35F3]"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Try-On Bag</span>
                </>
              ) : includeBackup && backupSize ? (
                <span>
                  Add Sizes {selectedSize} &amp; {backupSize} to Bag
                </span>
              ) : (
                <span>Add Size {selectedSize} to Try-On Bag</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#6E757C]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#131B2E]" aria-hidden="true" />
                <span>{hub.etaMinutes}-min rider dispatch</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" aria-hidden="true" />
                <span>40-min home trial window</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
