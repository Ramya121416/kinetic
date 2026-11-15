import { GenderEdit, HubLocation, Product, ProductCategory } from '../types/store';

import heroLookbookImg from '../assets/images/hero_editorial_lookbook_1794731777574.jpg';
import trenchCoatImg from '../assets/images/prod_trench_coat_1794731777287.jpg';
import linenOvershirtImg from '../assets/images/prod_linen_overshirt_1794731778164.jpg';
import pleatedTrousersImg from '../assets/images/prod_pleated_trousers_1794731777436.jpg';
import knitPoloImg from '../assets/images/prod_knit_polo_1794731778917.jpg';
import leatherJacketImg from '../assets/images/prod_leather_jacket_1794731778552.jpg';
import runnerSneakerImg from '../assets/images/prod_runner_sneaker_1794731779717.jpg';
import silkSlipDressImg from '../assets/images/prod_silk_slip_dress_1794731779980.jpg';
import structuredToteImg from '../assets/images/prod_structured_tote_1794731780381.jpg';

export const HERO_LOOKBOOK_IMAGE = heroLookbookImg;

export const HUB_LOCATIONS: HubLocation[] = [
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar 100ft Rd',
    city: 'Bengaluru',
    pincode: '560038',
    etaMinutes: 26,
    riderPool: '14 riders active',
  },
  {
    id: 'blr-koramangala',
    name: 'Koramangala 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
    etaMinutes: 29,
    riderPool: '11 riders active',
  },
  {
    id: 'blr-hsr',
    name: 'HSR Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    etaMinutes: 32,
    riderPool: '9 riders active',
  },
  {
    id: 'bom-bandra',
    name: 'Bandra West Chapel Rd',
    city: 'Mumbai',
    pincode: '400050',
    etaMinutes: 24,
    riderPool: '16 riders active',
  },
];

export const CATALOG_PRODUCTS: Product[] = [
  {
    id: 'kc-trench-01',
    brand: 'Auteur Studio',
    title: 'Double-Breasted Wool Trench',
    category: ProductCategory.OUTERWEAR,
    gender: GenderEdit.WOMEN,
    priceInr: 12800,
    image: trenchCoatImg,
    fabric: '78% Virgin Wool, 22% Polyamide · Cupro Lining',
    fitNote: 'Relaxed architectural shoulder. Take your usual size or add one size up for layering.',
    description:
      'Cut in brushed obsidian wool-blend with storm lapels, belted cuffs, and deep welt pockets. Steamed on arrival and packed on garment hangers.',
    isNewArrival: true,
    sizes: [
      { size: 'XS', inHubCount: 2 },
      { size: 'S', inHubCount: 4 },
      { size: 'M', inHubCount: 3 },
      { size: 'L', inHubCount: 1 },
      { size: 'XL', inHubCount: 0 },
    ],
  },
  {
    id: 'kc-linen-02',
    brand: 'Noir & Ecru',
    title: 'Heavyweight Organic Linen Overshirt',
    category: ProductCategory.OUTERWEAR,
    gender: GenderEdit.MEN,
    priceInr: 5490,
    image: linenOvershirtImg,
    fabric: '100% Belgian Flax Linen · 310 GSM',
    fitNote: 'Boxy tailored drape. Fits true to size over tees or fine knits.',
    description:
      'Woven from high-density washed flax in warm ecru with matte horn buttons and twin bellows chest pockets.',
    isNewArrival: true,
    sizes: [
      { size: 'S', inHubCount: 3 },
      { size: 'M', inHubCount: 5 },
      { size: 'L', inHubCount: 2 },
      { size: 'XL', inHubCount: 2 },
    ],
  },
  {
    id: 'kc-trouser-03',
    brand: 'Sartoria Mono',
    title: 'Double-Pleated Wide Wool Trousers',
    category: ProductCategory.TAILORING,
    gender: GenderEdit.MEN,
    priceInr: 6290,
    image: pleatedTrousersImg,
    fabric: '100% Super 110s Combed Wool',
    fitNote: 'High-rise waist with generous full-length leg and 4cm turn-up cuff.',
    description:
      'Crisp double forward pleats in slate charcoal suiting wool, finished with an extended tab waistband and horn closures.',
    sizes: [
      { size: '28', inHubCount: 2 },
      { size: '30', inHubCount: 4 },
      { size: '32', inHubCount: 3 },
      { size: '34', inHubCount: 1 },
      { size: '36', inHubCount: 2 },
    ],
  },
  {
    id: 'kc-knit-04',
    brand: 'Kinetix Knitlab',
    title: 'Ribbed Merino Open-Collar Polo',
    category: ProductCategory.KNITWEAR,
    gender: GenderEdit.WOMEN,
    priceInr: 4890,
    image: knitPoloImg,
    fabric: '100% Extra-Fine Australian Merino Wool',
    fitNote: 'Contoured slim rib fit. Consider adding a backup size up for a looser drape.',
    description:
      'Fine-gauge 14gg rib knit in electric cobalt with a clean Johnny collar and tubular hem finishing.',
    isNewArrival: true,
    sizes: [
      { size: 'XS', inHubCount: 3 },
      { size: 'S', inHubCount: 4 },
      { size: 'M', inHubCount: 2 },
      { size: 'L', inHubCount: 1 },
    ],
  },
  {
    id: 'kc-leather-05',
    brand: 'Atelier Velo',
    title: 'Cropped Espresso Grain Leather Blouson',
    category: ProductCategory.OUTERWEAR,
    gender: GenderEdit.WOMEN,
    priceInr: 18400,
    image: leatherJacketImg,
    fabric: '100% Full-Grain Vegetable-Tanned Calfskin',
    fitNote: 'Cropped boxy waist with articulated sleeves. True to size.',
    description:
      'Supple drum-dyed espresso calfskin blouson featuring brushed nickel two-way zip hardware and rib-knit collar trim.',
    sizes: [
      { size: 'XS', inHubCount: 1 },
      { size: 'S', inHubCount: 2 },
      { size: 'M', inHubCount: 2 },
      { size: 'L', inHubCount: 0 },
    ],
  },
  {
    id: 'kc-sneaker-06',
    brand: 'Forma Footwear',
    title: 'Bone Suede & Technical Mesh Runner',
    category: ProductCategory.FOOTWEAR,
    gender: GenderEdit.ALL,
    priceInr: 8900,
    image: runnerSneakerImg,
    fabric: 'Italian Split Suede, Ballistic Mesh & Vibram Outsole',
    fitNote: 'Standard European width. Order two adjacent UK sizes for doorstep fit check.',
    description:
      'Low-profile urban runner engineered with tonal bone suede overlays, breathable charcoal mesh, and high-grip sculpted EVA sole.',
    isNewArrival: true,
    sizes: [
      { size: 'UK 6', inHubCount: 2 },
      { size: 'UK 7', inHubCount: 3 },
      { size: 'UK 8', inHubCount: 4 },
      { size: 'UK 9', inHubCount: 2 },
      { size: 'UK 10', inHubCount: 1 },
    ],
  },
  {
    id: 'kc-dress-07',
    brand: 'Auteur Studio',
    title: 'Bias-Cut Champagne Silk Midi Dress',
    category: ProductCategory.DRESSES_BAGS,
    gender: GenderEdit.WOMEN,
    priceInr: 9600,
    image: silkSlipDressImg,
    fabric: '100% 22-Momme Mulberry Silk Charmeuse',
    fitNote: 'Bias cut skims body contours naturally; adjustable rouleau straps.',
    description:
      'Fluid evening slip dress cut on a 45-degree bias in luminous champagne silk with subtle cowl neckline and French seams.',
    sizes: [
      { size: 'XS', inHubCount: 2 },
      { size: 'S', inHubCount: 3 },
      { size: 'M', inHubCount: 2 },
      { size: 'L', inHubCount: 1 },
    ],
  },
  {
    id: 'kc-tote-08',
    brand: 'Forma Objects',
    title: 'East-West Architectural Leather Tote',
    category: ProductCategory.DRESSES_BAGS,
    gender: GenderEdit.ALL,
    priceInr: 11200,
    image: structuredToteImg,
    fabric: '100% Box Calfskin · Suede Interior',
    fitNote: 'Fits 14-inch laptop, water bottle, and daily essentials.',
    description:
      'Structured matte black tote reinforced with corner gussets, twin silver buckle straps, and a magnetic center clasp.',
    sizes: [{ size: 'One Size', inHubCount: 4 }],
  },
];

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
