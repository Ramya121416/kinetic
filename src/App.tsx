import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ResilientImage } from './components/ResilientImage';
import { TryOnDrawer } from './components/TryOnDrawer';
import {
  CATALOG_PRODUCTS,
  HERO_LOOKBOOK_IMAGE,
  HUB_LOCATIONS,
  formatInr,
} from './data/catalog';
import {
  ActiveOrder,
  BagItem,
  CustomerCheckoutInfo,
  GenderEdit,
  HubLocation,
  OrderStage,
  Product,
  ProductCategory,
  TrialDecision,
} from './types/store';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

const CATEGORY_OPTIONS: ProductCategory[] = [
  ProductCategory.ALL,
  ProductCategory.OUTERWEAR,
  ProductCategory.TAILORING,
  ProductCategory.KNITWEAR,
  ProductCategory.DRESSES_BAGS,
  ProductCategory.FOOTWEAR,
];

export default function App() {
  const [selectedHub, setSelectedHub] = useState<HubLocation>(HUB_LOCATIONS[0]);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>(ProductCategory.ALL);
  const [genderFilter, setGenderFilter] = useState<GenderEdit>(GenderEdit.ALL);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Live 1-second countdown when Doorstep Trial is active
  useEffect(() => {
    if (!activeOrder || activeOrder.stage !== OrderStage.DOORSTEP_TRIAL) return;
    const timer = window.setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev || prev.stage !== OrderStage.DOORSTEP_TRIAL) return prev;
        if (prev.trialSecondsRemaining <= 0) return prev;
        return {
          ...prev,
          trialSecondsRemaining: prev.trialSecondsRemaining - 1,
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeOrder?.stage]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = CATALOG_PRODUCTS.filter((item) => {
      if (categoryFilter !== ProductCategory.ALL && item.category !== categoryFilter) {
        return false;
      }
      if (
        genderFilter !== GenderEdit.ALL &&
        item.gender !== GenderEdit.ALL &&
        item.gender !== genderFilter
      ) {
        return false;
      }
      if (onlyNewArrivals && !item.isNewArrival) {
        return false;
      }
      if (q) {
        const haystack = `${item.brand} ${item.title} ${item.category} ${item.fabric}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.priceInr - b.priceInr);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.priceInr - a.priceInr);
    }
    return list;
  }, [categoryFilter, genderFilter, onlyNewArrivals, searchQuery, sortBy]);

  const totalBagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToBag = (product: Product, primarySize: string, backupSize?: string) => {
    setBagItems((prev) => {
      const next = [...prev];
      const addLine = (size: string, isBackup: boolean) => {
        const lineId = `${product.id}-${size}`;
        const existingIndex = next.findIndex((entry) => entry.lineId === lineId);
        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + 1,
          };
        } else {
          next.push({
            lineId,
            product,
            size,
            quantity: 1,
            isBackupTrialSize: isBackup,
            decision: isBackup ? TrialDecision.RETURN : TrialDecision.RETAIN,
          });
        }
      };

      addLine(primarySize, false);
      if (backupSize && backupSize !== primarySize) {
        addLine(backupSize, true);
      }
      return next;
    });

    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1200);
  };

  const handleQuickAdd = (product: Product) => {
    const defaultSize =
      product.sizes.find((s) => s.inHubCount > 0)?.size ?? product.sizes[0]?.size;
    if (!defaultSize) return;
    handleAddToBag(product, defaultSize);
  };

  const handleUpdateQty = (lineId: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (lineId: string) => {
    setBagItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const handlePlaceOrder = (customer: CustomerCheckoutInfo) => {
    const orderNum = `#SLK-${Math.floor(4100 + Math.random() * 5800)}`;
    const now = new Date();
    const placedAtLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveOrder({
      orderNumber: orderNum,
      hub: selectedHub,
      customer,
      items: bagItems.map((item) => ({ ...item })),
      stage: OrderStage.EN_ROUTE,
      riderName: 'Arjun M. · EV Scooter',
      etaMinutesRemaining: selectedHub.etaMinutes,
      trialSecondsRemaining: 40 * 60,
      placedAtLabel,
    });
    setBagItems([]);
  };

  const handleAdvanceOrderStage = () => {
    setActiveOrder((prev) => {
      if (!prev) return null;
      if (prev.stage === OrderStage.PACKING) {
        return { ...prev, stage: OrderStage.EN_ROUTE, etaMinutesRemaining: 8 };
      }
      if (prev.stage === OrderStage.EN_ROUTE) {
        return {
          ...prev,
          stage: OrderStage.DOORSTEP_TRIAL,
          etaMinutesRemaining: 0,
          trialSecondsRemaining: 40 * 60,
        };
      }
      if (prev.stage === OrderStage.DOORSTEP_TRIAL) {
        return { ...prev, stage: OrderStage.COMPLETED };
      }
      return prev;
    });
  };

  const handleToggleTrialDecision = (lineId: string, decision: TrialDecision) => {
    setActiveOrder((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.lineId === lineId ? { ...item, decision } : item
        ),
      };
    });
  };

  const handleStartSampleTrial = () => {
    const trench = CATALOG_PRODUCTS[0];
    const sneaker = CATALOG_PRODUCTS[5];
    setActiveOrder({
      orderNumber: '#SLK-4092',
      hub: selectedHub,
      customer: {
        fullName: 'Aarav Mehta',
        phone: '+91 98450 21890',
        address: '42, 12th Main Road, HAL 2nd Stage',
        pincode: selectedHub.pincode,
        paymentMode: 'try_and_buy',
      },
      items: [
        {
          lineId: `${trench.id}-S`,
          product: trench,
          size: 'S',
          quantity: 1,
          isBackupTrialSize: false,
          decision: TrialDecision.RETAIN,
        },
        {
          lineId: `${trench.id}-M`,
          product: trench,
          size: 'M',
          quantity: 1,
          isBackupTrialSize: true,
          decision: TrialDecision.RETURN,
        },
        {
          lineId: `${sneaker.id}-UK 8`,
          product: sneaker,
          size: 'UK 8',
          quantity: 1,
          isBackupTrialSize: false,
          decision: TrialDecision.RETAIN,
        },
      ],
      stage: OrderStage.DOORSTEP_TRIAL,
      riderName: 'Arjun M. · EV Scooter',
      etaMinutesRemaining: 0,
      trialSecondsRemaining: 38 * 60 + 42,
      placedAtLabel: '10:15 AM',
    });
    setIsDrawerOpen(true);
  };

  const navigateToEdit = (opts: {
    category?: ProductCategory;
    gender?: GenderEdit;
    newOnly?: boolean;
  }) => {
    setCategoryFilter(opts.category ?? ProductCategory.ALL);
    setGenderFilter(opts.gender ?? GenderEdit.ALL);
    setOnlyNewArrivals(Boolean(opts.newOnly));
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#131B2E]">
      {/* Strictly Compliant 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 h-16 bg-[#FBFBFA]/95 backdrop-blur-xs border-b border-[#E4E4DE]">
        <div className="max-w-[1360px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-extrabold tracking-tight text-[#131B2E] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0D35F3]"
          >
            KINETIC
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary categories"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#444657]"
          >
            <button
              type="button"
              onClick={() => navigateToEdit({ newOnly: true })}
              className="hover:text-[#131B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              New In
            </button>
            <button
              type="button"
              onClick={() => navigateToEdit({ gender: GenderEdit.WOMEN })}
              className="hover:text-[#131B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Women
            </button>
            <button
              type="button"
              onClick={() => navigateToEdit({ gender: GenderEdit.MEN })}
              className="hover:text-[#131B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Men
            </button>
            <button
              type="button"
              onClick={() => navigateToEdit({ category: ProductCategory.FOOTWEAR })}
              className="hover:text-[#131B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Footwear
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeOrder) {
                  setIsDrawerOpen(true);
                } else {
                  document.getElementById('try-return')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-[#131B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Try &amp; Return
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="h-10 px-4 rounded bg-[#0D35F3] text-white text-xs font-semibold tracking-wide hover:bg-[#0023BB] transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D35F3]"
            >
              {activeOrder && activeOrder.stage === OrderStage.DOORSTEP_TRIAL
                ? `Trial Active (${activeOrder.items.length})`
                : `Bag (${totalBagCount})`}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Split-Screen Editorial Hero */}
        <section className="border-b border-[#E4E4DE]">
          <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Hero Left Copy & Local Hub Selector */}
            <div className="lg:col-span-6 px-4 sm:px-6 lg:px-12 py-10 lg:py-16 flex flex-col justify-between gap-10">
              {/* Interactive Neighborhood Hub Selector */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#444657]">
                <label
                  htmlFor="hub-select"
                  className="inline-flex items-center gap-1.5 font-medium text-[#131B2E]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0D35F3]" aria-hidden="true" />
                  <span>Hub:</span>
                </label>
                <select
                  id="hub-select"
                  value={selectedHub.id}
                  onChange={(e) => {
                    const found = HUB_LOCATIONS.find((h) => h.id === e.target.value);
                    if (found) setSelectedHub(found);
                  }}
                  className="h-9 px-2.5 rounded bg-[#F4F4F0] border border-[#E4E4DE] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                >
                  {HUB_LOCATIONS.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}, {hub.city}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="text-[#6E757C]">
                  ·
                </span>
                <span className="font-mono tabular-nums text-[#4A5D4E] font-medium">
                  {selectedHub.etaMinutes} min dispatch
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-[#6E757C]">
                  ·
                </span>
                <span className="hidden sm:inline text-[#6E757C]">{selectedHub.riderPool}</span>
              </div>

              <div className="space-y-5 max-w-xl">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.06] tracking-tight text-[#131B2E] text-balance">
                  Runway silhouettes, at your door in 30 minutes.
                </h1>
                <p className="text-base sm:text-[17px] leading-relaxed text-[#444657] max-w-lg">
                  Select garments in up to two sizes from your nearest neighborhood hub. Try them on at home for 40 minutes, hand back misses to your rider, and pay only for what stays.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#collection"
                    className="h-12 px-6 rounded bg-[#0D35F3] text-white text-sm font-semibold hover:bg-[#0023BB] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>Explore Local Edit</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={handleStartSampleTrial}
                    className="h-12 px-5 rounded border border-[#131B2E] bg-transparent text-[#131B2E] text-sm font-semibold hover:bg-[#F4F4F0] transition-colors whitespace-nowrap shrink-0"
                  >
                    Preview 40-Min Trial
                  </button>
                </div>
              </div>

              {/* Clean Typographic Service Proof Strip */}
              <div className="pt-6 border-t border-[#E4E4DE] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#131B2E] block">
                    {selectedHub.etaMinutes} min
                  </span>
                  <span className="text-[#6E757C]">Hub dispatch</span>
                </div>
                <div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#131B2E] block">
                    40 min
                  </span>
                  <span className="text-[#6E757C]">Doorstep trial</span>
                </div>
                <div>
                  <span className="font-mono text-sm font-bold tabular-nums text-[#131B2E] block">
                    ₹0 upfront
                  </span>
                  <span className="text-[#6E757C]">Pay for kept items</span>
                </div>
              </div>
            </div>

            {/* Hero Right Lookbook Photo */}
            <div className="lg:col-span-6 bg-[#F4F4F0] border-t lg:border-t-0 lg:border-l border-[#E4E4DE] relative min-h-[380px] lg:min-h-[600px]">
              <ResilientImage
                src={HERO_LOOKBOOK_IMAGE}
                alt="Two models wearing Kinetic Autumn Capsule tailored wool trench coat and ecru linen suiting"
                fallbackLabel="Autumn Capsule Lookbook"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/35 to-transparent text-white">
                <p className="text-xs font-mono tracking-wide text-white/80">
                  Autumn Capsule · Steamed &amp; Hanger-Delivered
                </p>
                <p className="text-sm sm:text-base font-medium mt-1">
                  Live stock ready inside {selectedHub.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Featured Collection & Interactive Filters */}
        <section id="collection" className="py-14 lg:py-20">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4E4DE] pb-6">
              <div>
                <p className="text-xs font-medium text-[#6E757C]">
                  {selectedHub.name} · {filteredProducts.length} silhouettes ready for{' '}
                  <span className="font-mono tabular-nums">{selectedHub.etaMinutes}-min</span>{' '}
                  delivery
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#131B2E] mt-1">
                  Curated Hub Edit
                </h2>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-[#6E757C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search garments or fabric..."
                    aria-label="Search garments or fabric"
                    className="h-10 w-56 sm:w-64 pl-9 pr-3 rounded bg-white border border-[#E4E4DE] text-xs text-[#131B2E] placeholder:text-[#6E757C] focus:outline-none focus:border-[#0D35F3]"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#6E757C]" aria-hidden="true" />
                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-10 px-3 rounded bg-white border border-[#E4E4DE] text-xs font-medium text-[#131B2E] focus:outline-none focus:border-[#0D35F3]"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Tabs & Gender Segmented Control */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Product categories"
                className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4F4F0] border border-[#E4E4DE] rounded w-fit"
              >
                {CATEGORY_OPTIONS.map((cat) => {
                  const isActive = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setCategoryFilter(cat)}
                      className={`h-9 px-3.5 rounded-sm text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-white text-[#131B2E] shadow-xs font-semibold'
                          : 'text-[#6E757C] hover:text-[#131B2E]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-[#F4F4F0] border border-[#E4E4DE] rounded">
                  {[GenderEdit.ALL, GenderEdit.WOMEN, GenderEdit.MEN].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderFilter(g)}
                      className={`h-8 px-3 rounded-sm text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        genderFilter === g
                          ? 'bg-[#131B2E] text-white'
                          : 'text-[#6E757C] hover:text-[#131B2E]'
                      }`}
                    >
                      {g === GenderEdit.ALL ? 'All Edits' : g}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setOnlyNewArrivals((prev) => !prev)}
                  className={`h-10 px-3.5 rounded border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    onlyNewArrivals
                      ? 'border-[#0D35F3] bg-[#0D35F3] text-white'
                      : 'border-[#E4E4DE] bg-white text-[#131B2E] hover:bg-[#F4F4F0]'
                  }`}
                >
                  New Arrivals
                </button>
              </div>
            </div>

            {/* 3-Column Uniform Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 px-6 rounded bg-[#F4F4F0] border border-[#E4E4DE] text-center space-y-3">
                <p className="font-display text-xl font-bold text-[#131B2E]">
                  No silhouettes match your current filter.
                </p>
                <p className="text-xs text-[#6E757C]">
                  Try clearing your search query or viewing all pieces in {selectedHub.name}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter(ProductCategory.ALL);
                    setGenderFilter(GenderEdit.ALL);
                    setOnlyNewArrivals(false);
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 rounded bg-[#131B2E] text-white text-xs font-semibold hover:bg-[#2C343E] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const defaultSize =
                    product.sizes.find((s) => s.inHubCount > 0)?.size ??
                    product.sizes[0]?.size ??
                    '';
                  const isAdded = recentlyAddedId === product.id;

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[3/4] w-full bg-[#F4F4F0] border border-[#E4E4DE] rounded overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setActiveProduct(product)}
                          className="w-full h-full block text-left focus-visible:outline-2 focus-visible:outline-[#0D35F3]"
                          aria-label={`View ${product.title} by ${product.brand}`}
                        >
                          <ResilientImage
                            src={product.image}
                            alt={`${product.brand} ${product.title}`}
                            fallbackLabel={product.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </button>

                        {/* Quick-Add Floating Control */}
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity duration-150">
                          <button
                            type="button"
                            onClick={() => setActiveProduct(product)}
                            className="h-9 px-3 rounded bg-[#FBFBFA]/95 border border-[#E4E4DE] text-xs font-semibold text-[#131B2E] hover:bg-white transition-colors whitespace-nowrap"
                          >
                            Try 2 Sizes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(product)}
                            className={`h-9 px-3 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
                              isAdded
                                ? 'bg-[#4A5D4E] text-white'
                                : 'bg-[#0D35F3] text-white hover:bg-[#0023BB]'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{isAdded ? 'Added' : `Quick Add · ${defaultSize}`}</span>
                          </button>
                        </div>
                      </div>

                      {/* Clean Unboxed Card Metadata */}
                      <div className="pt-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#6E757C]">
                          <span className="font-medium text-[#444657]">{product.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {selectedHub.etaMinutes} min
                          </span>
                          {product.isNewArrival && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#0D35F3] font-medium">New</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => setActiveProduct(product)}
                            className="text-left text-base font-semibold text-[#131B2E] hover:text-[#0D35F3] transition-colors truncate"
                          >
                            {product.title}
                          </button>
                          <span className="font-mono text-[15px] font-semibold tabular-nums text-[#131B2E] shrink-0">
                            {formatInr(product.priceInr)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Story / Doorstep Try & Return Model */}
        <section
          id="try-return"
          className="bg-[#F4F4F0] border-y border-[#E4E4DE] py-16 lg:py-20"
        >
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <p className="text-xs font-medium text-[#4A5D4E]">
                  Doorstep Try &amp; Return Protocol
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#131B2E] text-balance">
                  Your living room is the fitting room.
                </h2>
              </div>
              <button
                type="button"
                onClick={handleStartSampleTrial}
                className="h-11 px-5 rounded bg-[#131B2E] text-white text-xs font-semibold hover:bg-[#2C343E] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <span>Open Live Trial Demo</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="p-6 bg-[#FBFBFA] border border-[#E4E4DE] rounded space-y-2.5">
                <h3 className="font-display text-lg font-bold text-[#131B2E]">
                  01. Local Hub Dispatch
                </h3>
                <p className="text-sm leading-relaxed text-[#444657]">
                  Every piece is stored steamed on cedar hangers inside neighborhood micro-hubs and dispatched by EV rider in under 30 minutes.
                </p>
              </div>

              <div className="p-6 bg-[#FBFBFA] border border-[#E4E4DE] rounded space-y-2.5">
                <h3 className="font-display text-lg font-bold text-[#131B2E]">
                  02. Dual-Size Trial Window
                </h3>
                <p className="text-sm leading-relaxed text-[#444657]">
                  Unsure between two sizes? Add a backup size at ₹0 upfront. When your rider arrives, a 40-minute home trial timer begins.
                </p>
              </div>

              <div className="p-6 bg-[#FBFBFA] border border-[#E4E4DE] rounded space-y-2.5">
                <h3 className="font-display text-lg font-bold text-[#131B2E]">
                  03. Instant Rider Handover
                </h3>
                <p className="text-sm leading-relaxed text-[#444657]">
                  Mark garments as Keep or Return directly inside your Try-On Drawer. Hand spares back without boxes, tape, or refund waits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#FBFBFA] py-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#6E757C]">
          <div className="space-y-1">
            <span className="font-display text-base font-extrabold text-[#131B2E] block">
              KINETIC
            </span>
            <span>Bengaluru · Mumbai · 30-Minute Urban Apparel Hubs</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#collection" className="hover:text-[#131B2E] transition-colors">
              Hub Catalog
            </a>
            <a href="#try-return" className="hover:text-[#131B2E] transition-colors">
              Try &amp; Return Policy
            </a>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hover:text-[#131B2E] transition-colors"
            >
              Active Bag ({totalBagCount})
            </button>
            <span>© 2026 Kinetic Atelier</span>
          </div>
        </div>
      </footer>

      {/* Contiguous Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        hub={selectedHub}
        onClose={() => setActiveProduct(null)}
        onAddToBag={handleAddToBag}
      />

      {/* Unified Try-On Bag, Checkout & 40-Min Doorstep Trial Drawer */}
      <TryOnDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        hub={selectedHub}
        bagItems={bagItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        activeOrder={activeOrder}
        onPlaceOrder={handlePlaceOrder}
        onAdvanceOrderStage={handleAdvanceOrderStage}
        onToggleTrialDecision={handleToggleTrialDecision}
        onStartSampleTrial={handleStartSampleTrial}
        onResetOrder={() => setActiveOrder(null)}
      />
    </div>
  );
}
