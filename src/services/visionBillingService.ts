import { Product, PhotoRecognitionResult, VisionMatchCandidate } from '../types';
import { dbService } from '../database/sqlite';

// Real-world sample products with packaging image references for instant visual demo testing
export interface DemoProductSample {
  id: string;
  name: string;
  brand: string;
  category: string;
  sampleImageUrl: string;
  extractedMockText: string;
  keywords: string[];
}

export const DEMO_PRODUCT_SAMPLES: DemoProductSample[] = [
  {
    id: 'demo-1',
    name: 'Amul Butter 100g (Pasteurised)',
    brand: 'Amul',
    category: 'dairy',
    sampleImageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80',
    extractedMockText: 'AMUL PASTEURISED BUTTER NET WEIGHT 100g UTTERLY BUTTERLY DELICIOUS INGREDIENTS BUTTER COMMON SALT',
    keywords: ['amul', 'butter', 'pasteurised', '100g', 'salted'],
  },
  {
    id: 'demo-2',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    brand: 'Tata',
    category: 'groceries',
    sampleImageUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80',
    extractedMockText: 'TATA SALT DESH KA NAMAK VACUUM EVAPORATED IODISED SALT NET QUANTITY 1kg',
    keywords: ['tata', 'salt', 'namak', 'iodised', '1kg'],
  },
  {
    id: 'demo-3',
    name: 'Cadbury Dairy Milk Silk Chocolate 60g',
    brand: 'Cadbury',
    category: 'snacks',
    sampleImageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',
    extractedMockText: 'CADBURY DAIRY MILK SILK PREMIUM MILK CHOCOLATE NET WT 60g 100% SUSTAINABLY SOURCED COCOA',
    keywords: ['cadbury', 'dairy milk', 'silk', 'chocolate', '60g'],
  },
  {
    id: 'demo-4',
    name: 'Maggi 2-Minute Masala Noodles 70g',
    brand: 'Nestle Maggi',
    category: 'snacks',
    sampleImageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&q=80',
    extractedMockText: 'NESTLE MAGGI 2 MINUTE NOODLES TASTEMAKER MASALA WITH IRON NET WT 70g',
    keywords: ['maggi', 'noodles', 'masala', 'nestle', '70g'],
  },
  {
    id: 'demo-5',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    brand: 'Fortune',
    category: 'groceries',
    sampleImageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    extractedMockText: 'FORTUNE SUNLITE REFINED SUNFLOWER OIL RICH IN VITAMIN A AND D NET VOLUME 1 LITRE',
    keywords: ['fortune', 'sunlite', 'sunflower', 'oil', '1l'],
  },
  {
    id: 'demo-6',
    name: 'Dettol Original Bathing Soap 75g (Buy 3 Get 1)',
    brand: 'Dettol',
    category: 'personal_care',
    sampleImageUrl: 'https://images.unsplash.com/photo-1607006314144-482f34969420?w=600&q=80',
    extractedMockText: 'DETTOL ORIGINAL 99.9% GERM PROTECTION BATHING SOAP BAR NET WT 75g',
    keywords: ['dettol', 'soap', 'original', 'germ', '75g'],
  },
];

class VisionBillingService {
  /**
   * Process a captured product photo or selected image
   * @param imageUri - Local URI or web URL of the photo
   * @param rawOcrOverride - Optional OCR text (if available from native scanner)
   */
  public async recognizeProductFromPhoto(
    imageUri: string,
    rawOcrOverride?: string
  ): Promise<PhotoRecognitionResult> {
    const products = await dbService.getProducts();

    // 1. Simulate on-device OCR / Visual Recognition text extraction
    let recognizedText = rawOcrOverride || '';

    if (!recognizedText) {
      // Check if image matches one of the demo samples
      const sample = DEMO_PRODUCT_SAMPLES.find((s) => s.sampleImageUrl === imageUri);
      if (sample) {
        recognizedText = sample.extractedMockText;
      } else {
        // Fallback OCR heuristic extraction from filename or URI
        recognizedText = this.deriveTextFromUri(imageUri);
      }
    }

    const cleanTokens = this.tokenize(recognizedText);

    // 2. Score every product in the SQLite database
    const candidates: VisionMatchCandidate[] = [];

    for (const prod of products) {
      const { score, matchedKeywords } = this.calculateMatchScore(prod, cleanTokens, recognizedText);
      if (score > 15) {
        candidates.push({
          product: prod,
          confidenceScore: Math.min(100, Math.round(score)),
          matchedKeywords,
        });
      }
    }

    // Sort descending by confidence score
    candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const bestMatch = candidates.length > 0 && candidates[0].confidenceScore >= 45 ? candidates[0] : undefined;

    // 3. Extract detected name, brand, suggested GST and HSN
    let detectedName = bestMatch ? bestMatch.product.name : this.extractProductName(recognizedText);
    let extractedBrand = bestMatch ? bestMatch.product.brand : this.extractBrand(recognizedText);
    const suggestedCategory = bestMatch ? bestMatch.product.category : this.inferCategory(recognizedText);
    const suggestedGstRate = bestMatch ? bestMatch.product.gstRate : this.inferGstRate(suggestedCategory, recognizedText);
    const suggestedHsn = bestMatch ? bestMatch.product.hsn : this.inferHsn(suggestedCategory);

    return {
      detectedName,
      extractedBrand,
      suggestedGstRate,
      suggestedHsn,
      suggestedCategory,
      extractedText: recognizedText,
      bestMatch,
      otherCandidates: candidates.slice(1, 4),
      isNewProduct: !bestMatch || bestMatch.confidenceScore < 60,
    };
  }

  private calculateMatchScore(
    product: Product,
    tokens: string[],
    fullTextUpper: string
  ): { score: number; matchedKeywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    const nameUpper = product.name.toUpperCase();
    const brandUpper = product.brand.toUpperCase();
    const keywords = (product.keywords || []).map((k) => k.toUpperCase());

    // Check Brand match
    if (brandUpper && fullTextUpper.includes(brandUpper)) {
      score += 40;
      matchedKeywords.push(product.brand);
    }

    // Check exact product name substring
    if (fullTextUpper.includes(nameUpper)) {
      score += 50;
      matchedKeywords.push(product.name);
    }

    // Check individual keywords
    for (const kw of keywords) {
      if (kw.length >= 3) {
        if (tokens.includes(kw) || fullTextUpper.includes(kw)) {
          score += 15;
          if (!matchedKeywords.includes(kw)) {
            matchedKeywords.push(kw);
          }
        }
      }
    }

    // Check barcode match
    if (product.barcode && fullTextUpper.includes(product.barcode)) {
      score += 100;
      matchedKeywords.push(`Barcode:${product.barcode}`);
    }

    return { score, matchedKeywords };
  }

  private tokenize(text: string): string[] {
    return text
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  private deriveTextFromUri(uri: string): string {
    // If user takes a photo or provides an unknown image, extract reasonable text cues
    const filename = uri.split('/').pop() || '';
    const clean = filename.replace(/[_\-\.]+/g, ' ').toUpperCase();
    if (clean.length > 5) {
      return `PRODUCT SCAN ${clean} RETAIL PACKAGING 100G`;
    }
    return 'RETAIL PRODUCT PACKAGING ITEM WITH GST BARCODE';
  }

  private extractBrand(text: string): string {
    const knownBrands = [
      'AMUL', 'TATA', 'AASHIRVAAD', 'FORTUNE', 'CADBURY', 'NESTLE', 'MAGGI',
      'DETTOL', 'COLGATE', 'SURF EXCEL', 'COCA-COLA', 'PEPSI', 'RED LABEL',
      'BRITANNIA', 'PARLE', 'HALDIRAM', 'VIM', 'DOVE', 'LAYS', 'KURKURE'
    ];
    const upper = text.toUpperCase();
    for (const b of knownBrands) {
      if (upper.includes(b)) {
        return b.charAt(0) + b.slice(1).toLowerCase();
      }
    }
    return 'Retail General';
  }

  private extractProductName(text: string): string {
    const brand = this.extractBrand(text);
    const tokens = this.tokenize(text).slice(0, 5);
    if (tokens.length > 0) {
      return `${brand} ${tokens.join(' ').toLowerCase()}`;
    }
    return 'Scanned Retail Item';
  }

  private inferCategory(text: string): string {
    const upper = text.toUpperCase();
    if (upper.includes('BUTTER') || upper.includes('MILK') || upper.includes('CHEESE') || upper.includes('GHEE')) {
      return 'dairy';
    }
    if (upper.includes('SALT') || upper.includes('ATTA') || upper.includes('OIL') || upper.includes('RICE') || upper.includes('DAL')) {
      return 'groceries';
    }
    if (upper.includes('CHOCOLATE') || upper.includes('NOODLES') || upper.includes('BISCUIT') || upper.includes('SNACK')) {
      return 'snacks';
    }
    if (upper.includes('TEA') || upper.includes('COFFEE') || upper.includes('DRINK') || upper.includes('COLA') || upper.includes('JUICE')) {
      return 'beverages';
    }
    if (upper.includes('SOAP') || upper.includes('TOOTHPASTE') || upper.includes('SHAMPOO') || upper.includes('CREAM')) {
      return 'personal_care';
    }
    if (upper.includes('DETERGENT') || upper.includes('WASH') || upper.includes('CLEANER') || upper.includes('VIM')) {
      return 'cleaning';
    }
    return 'groceries';
  }

  private inferGstRate(category: string, text: string): number {
    const upper = text.toUpperCase();
    if (upper.includes('SALT') || upper.includes('MILK') || upper.includes('FRESH')) {
      return 0; // Exempt / Essential
    }
    if (category === 'groceries' || upper.includes('TEA') || upper.includes('ATTA') || upper.includes('OIL')) {
      return 5; // 5% GST
    }
    if (category === 'dairy' || upper.includes('BUTTER') || upper.includes('NOODLES')) {
      return 12; // 12% GST
    }
    if (upper.includes('COLA') || upper.includes('AERATED') || upper.includes('ENERGY DRINK')) {
      return 28; // 28% GST Luxury / Aerated
    }
    return 18; // Standard 18% GST (Soaps, Detergents, Personal Care, Chocolates)
  }

  private inferHsn(category: string): string {
    switch (category) {
      case 'dairy':
        return '0405';
      case 'groceries':
        return '1101';
      case 'snacks':
        return '1905';
      case 'beverages':
        return '2202';
      case 'personal_care':
        return '3306';
      case 'cleaning':
        return '3402';
      default:
        return '2106';
    }
  }
}

export const visionBillingService = new VisionBillingService();
