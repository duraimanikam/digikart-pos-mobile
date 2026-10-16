import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';
import { DetectionResult } from '../services/productRecognitionService';

interface DetectingProductScreenProps {
  imageUri: string;
  detectionResult: DetectionResult;
  onRetake: () => void;
  onProceedToConfirm: (product: Product) => void;
  onAddNewProductWithPhoto: (photoUri: string) => void;
  onQuickSaveAndAdd?: (product: Product, rate: number, quantity: number) => void;
  catalog: Product[];
}

export const DetectingProductScreen: React.FC<DetectingProductScreenProps> = ({
  imageUri,
  detectionResult,
  onRetake,
  onProceedToConfirm,
  onAddNewProductWithPhoto,
  onQuickSaveAndAdd,
  catalog,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [progress, setProgress] = useState(0.2);

  // Quick Inline Name & Product Add States when Name Not Found
  const [newProductName, setNewProductName] = useState(
    detectionResult.suggestedName || ''
  );
  const [newProductPrice, setNewProductPrice] = useState(
    (detectionResult.suggestedPrice || 50).toFixed(2)
  );
  const [newProductUnit, setNewProductUnit] = useState(
    detectionResult.suggestedUnit || '1 pcs'
  );
  const [newProductCategory, setNewProductCategory] = useState(
    detectionResult.suggestedCategory || 'General'
  );

  const [manualSearch, setManualSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    detectionResult.product
  );

  const status = detectionResult.status;
  const confidence = detectionResult.confidence;

  // Sync state when detectionResult updates
  useEffect(() => {
    if (detectionResult.suggestedName) {
      setNewProductName(detectionResult.suggestedName);
    }
    if (detectionResult.suggestedPrice) {
      setNewProductPrice(detectionResult.suggestedPrice.toFixed(2));
    }
    if (detectionResult.suggestedUnit) {
      setNewProductUnit(detectionResult.suggestedUnit);
    }
    if (detectionResult.suggestedCategory) {
      setNewProductCategory(detectionResult.suggestedCategory);
    }
    if (detectionResult.product) {
      setSelectedProduct(detectionResult.product);
    }
  }, [detectionResult]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(0.65);
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(1.0);
      setIsScanning(false);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const searchResults = manualSearch.trim()
    ? catalog.filter((p) =>
        p.name.toLowerCase().includes(manualSearch.toLowerCase())
      )
    : [];

  const handleQuickSaveAndAdd = () => {
    if (!newProductName.trim()) {
      Alert.alert('Product Name Required', 'Please type a name for this new product.');
      return;
    }

    const priceNum = parseFloat(newProductPrice) || 50;

    const createdProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      brand: 'Store Brand',
      category: newProductCategory.toLowerCase(),
      barcode:
        detectionResult.detectedBarcode ||
        `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      hsn: '0910',
      mrp: priceNum,
      purchaseRate: priceNum * 0.8,
      sellingPrice: priceNum,
      gstRate: 5,
      stock: 50,
      unit: newProductUnit.trim() || 'pcs',
      image: imageUri,
      keywords: [newProductName.toLowerCase(), newProductCategory.toLowerCase()],
    };

    if (onQuickSaveAndAdd) {
      onQuickSaveAndAdd(createdProduct, priceNum, 1);
    } else {
      onProceedToConfirm(createdProduct);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 3 Header */}
      <AppHeader title="Detecting Product" showBack={true} onBack={onRetake} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Captured Product Image Container */}
        <View style={styles.imageCard}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.capturedImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImg}>
              <Ionicons name="image-outline" size={48} color="#94A3B8" />
            </View>
          )}

          {/* Barcode badge if barcode was recognized */}
          {detectionResult.detectedBarcode && (
            <View style={styles.barcodeOverlayBadge}>
              <Ionicons name="barcode-outline" size={14} color="#FFFFFF" />
              <Text style={styles.barcodeOverlayText}>
                {detectionResult.detectedBarcode}
              </Text>
            </View>
          )}
        </View>

        {/* Progress & Scanning status */}
        <View style={styles.scanStatusSection}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: isScanning ? `${progress * 100}%` : '100%' },
              ]}
            />
          </View>
          <Text style={styles.identifyingText}>
            {isScanning
              ? 'Analyzing Barcode & Package OCR...'
              : status === 'EXACT_MATCH'
              ? 'Verified Product Match Found!'
              : 'Name Not Found in Catalog - Add Product Below'}
          </Text>
        </View>

        {/* SCENARIO A: EXACT MATCH (Confidence >= 70%) */}
        {!isScanning && status === 'EXACT_MATCH' && selectedProduct && (
          <View style={styles.resultCard}>
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: selectedProduct.image || imageUri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>

            <View style={styles.resultDetails}>
              <Text style={styles.productName} numberOfLines={1}>
                {selectedProduct.name}
              </Text>
              <Text style={styles.productUnit}>{selectedProduct.unit}</Text>

              {/* Match Badge */}
              <View style={styles.matchBadge}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
                <Text style={styles.matchText}>{confidence}% match</Text>
              </View>
            </View>
          </View>
        )}

        {/* SCENARIO B: NAME NOT FOUND -> ADD A NAME FOR NEW PRODUCT RIGHT HERE */}
        {!isScanning && status !== 'EXACT_MATCH' && (
          <View style={styles.newProductCard}>
            <View style={styles.newProductCardHeader}>
              <View style={styles.alertCircle}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.newProductTitles}>
                <Text style={styles.newProductCardTitle}>Add Name for New Product</Text>
                <Text style={styles.newProductCardSub}>
                  Photo captured! OCR has read label text from the package below
                </Text>
              </View>
            </View>

            {/* OCR Live Packaging Text Readout Card */}
            <View style={styles.ocrLiveCard}>
              <View style={styles.ocrHeaderRow}>
                <View style={styles.ocrTag}>
                  <Ionicons name="scan-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.ocrTagText}>OCR TEXT READ FROM PACKAGE</Text>
                </View>
                <View style={styles.ocrLiveBadge}>
                  <View style={styles.ocrPulseDot} />
                  <Text style={styles.ocrLiveBadgeText}>OCR READ</Text>
                </View>
              </View>

              <Text style={styles.ocrDetectedText}>
                {detectionResult.rawOcrText ||
                  `[OCR Text]: "${newProductName || 'Packaging text'} • Net Wt: ${newProductUnit} • MRP: ₹${newProductPrice}"`}
              </Text>

              {/* Tappable OCR Word Chips */}
              {detectionResult.ocrWords && detectionResult.ocrWords.length > 0 && (
                <View style={styles.ocrChipsContainer}>
                  <Text style={styles.ocrChipsPrompt}>TAP OCR WORD TO ADD TO PRODUCT NAME:</Text>
                  <View style={styles.ocrChipsRow}>
                    {detectionResult.ocrWords.map((word, wIdx) => (
                      <TouchableOpacity
                        key={wIdx}
                        style={styles.ocrChip}
                        onPress={() => {
                          setNewProductName((prev) => {
                            if (!prev.trim()) return word;
                            if (prev.toLowerCase().includes(word.toLowerCase())) return prev;
                            return `${prev} ${word}`.trim();
                          });
                        }}
                      >
                        <Ionicons name="add" size={12} color={COLORS.primary} />
                        <Text style={styles.ocrChipText}>{word}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Product Name Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name (From OCR / Edit) *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Type product name (e.g. Parle-G Biscuits)"
                  placeholderTextColor="#94A3B8"
                  value={newProductName}
                  onChangeText={setNewProductName}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Price & Unit 2-Column Row */}
            <View style={styles.twoColRow}>
              <View style={[styles.inputGroup, styles.colHalf]}>
                <Text style={styles.inputLabel}>Price / Rate (₹) *</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="50.00"
                    placeholderTextColor="#94A3B8"
                    value={newProductPrice}
                    onChangeText={setNewProductPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.colHalf]}>
                <Text style={styles.inputLabel}>Unit / Weight</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="cube-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="1 pcs / 500 g"
                    placeholderTextColor="#94A3B8"
                    value={newProductUnit}
                    onChangeText={setNewProductUnit}
                  />
                </View>
              </View>
            </View>

            {/* 1-Tap Save Product & Add to Current Bill Button */}
            <TouchableOpacity
              style={styles.saveAndAddBtn}
              onPress={handleQuickSaveAndAdd}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.saveAndAddText}>Save & Add to Bill</Text>
            </TouchableOpacity>

            {/* Quick Suggestions & Catalog Search Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR LINK TO EXISTING PRODUCT</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Search Existing Catalog Input */}
            <View style={styles.searchLinkBox}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchLinkInput}
                placeholder="Search existing catalog to link..."
                placeholderTextColor="#94A3B8"
                value={manualSearch}
                onChangeText={setManualSearch}
              />
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsBox}>
                {searchResults.slice(0, 3).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setSelectedProduct(p);
                      onProceedToConfirm(p);
                    }}
                  >
                    <Text style={styles.resultItemName}>{p.name}</Text>
                    <Text style={styles.resultItemPrice}>₹{p.sellingPrice.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Suggested Candidates */}
            <View style={styles.candidatesList}>
              {detectionResult.candidates.map((cand, idx) => (
                <TouchableOpacity
                  key={cand.product.id || idx}
                  style={styles.candidateRow}
                  onPress={() => {
                    setSelectedProduct(cand.product);
                    onProceedToConfirm(cand.product);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.candidateLeft}>
                    <Text style={styles.candidateName}>{cand.product.name}</Text>
                    <Text style={styles.candidateUnit}>
                      {cand.product.unit} • ₹{cand.product.sellingPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.selectPill}>
                    <Text style={styles.selectPillText}>Select</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons matching Screen 3 */}
        <View style={styles.actionButtons}>
          {status === 'EXACT_MATCH' && selectedProduct && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onProceedToConfirm(selectedProduct)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>Add to Bill</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={onRetake}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-reverse-outline" size={18} color={COLORS.primary} />
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    padding: 16,
    paddingBottom: 30,
  },
  imageCard: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0B0F19',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    ...SHADOWS.card,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeOverlayBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  barcodeOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scanStatusSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  identifyingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginRight: 14,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  resultDetails: {
    flex: 1,
  },
  productName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  productUnit: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  matchText: {
    color: COLORS.successText,
    fontSize: 11,
    fontWeight: '700',
  },
  newProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  newProductCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  alertCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProductTitles: {
    flex: 1,
  },
  newProductCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  newProductCardSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  ocrLiveCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ocrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ocrTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ocrTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  ocrLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ocrPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  ocrLiveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  ocrDetectedText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
    lineHeight: 17,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 6,
  },
  ocrChipsContainer: {
    marginTop: 10,
  },
  ocrChipsPrompt: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  ocrChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ocrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEBFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  ocrChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },
  saveAndAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
    ...SHADOWS.card,
  },
  saveAndAddText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  searchLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 8,
  },
  searchLinkInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  searchResultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  resultItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  candidatesList: {
    gap: 8,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  candidateLeft: {
    flex: 1,
  },
  candidateName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  candidateUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  selectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  selectPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionButtons: {
    gap: 10,
    marginTop: 6,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  retakeBtn: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  retakeBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
