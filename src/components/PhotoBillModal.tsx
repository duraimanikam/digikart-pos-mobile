import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Product, PhotoRecognitionResult, ShopSettings } from '../types';
import {
  visionBillingService,
  DEMO_PRODUCT_SAMPLES,
  DemoProductSample,
} from '../services/visionBillingService';
import { dbService } from '../database/sqlite';

interface PhotoBillModalProps {
  visible: boolean;
  onClose: () => void;
  onAddProductToCart: (product: Product) => void;
  settings: ShopSettings;
}

export const PhotoBillModal: React.FC<PhotoBillModalProps> = ({
  visible,
  onClose,
  onAddProductToCart,
  settings,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recognitionResult, setRecognitionResult] = useState<PhotoRecognitionResult | null>(null);

  // New product quick-create form state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('50');
  const [newProductGst, setNewProductGst] = useState('18');
  const [newProductHsn, setNewProductHsn] = useState('2106');

  const resetState = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    setRecognitionResult(null);
    setNewProductName('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Launch on-device camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is required to take photos of products.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        processImage(uri);
      }
    } catch (e) {
      console.warn('Camera capture error:', e);
    }
  };

  // Pick from photo gallery
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        processImage(uri);
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    }
  };

  // Test with demo supermarket product packaging sample
  const handleSelectDemoSample = (sample: DemoProductSample) => {
    processImage(sample.sampleImageUrl, sample.extractedMockText);
  };

  // Run the Vision & OCR Billing Recognition Engine
  const processImage = async (imageUri: string, rawOcr?: string) => {
    setSelectedImage(imageUri);
    setIsAnalyzing(true);
    setRecognitionResult(null);

    // Give visual animation duration
    setTimeout(async () => {
      try {
        const result = await visionBillingService.recognizeProductFromPhoto(imageUri, rawOcr);
        setRecognitionResult(result);

        if (result.isNewProduct) {
          setNewProductName(result.detectedName);
          setNewProductGst(result.suggestedGstRate.toString());
          setNewProductHsn(result.suggestedHsn);
          setNewProductPrice('60');
        }
      } catch (err) {
        console.error('Vision analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 700);
  };

  // Bill matched product
  const handleBillMatchedProduct = (product: Product) => {
    onAddProductToCart(product);
    handleClose();
  };

  // Add new product to SQLite and bill immediately
  const handleSaveAndBillNewProduct = async () => {
    if (!newProductName.trim()) return;

    const price = parseFloat(newProductPrice) || 50;
    const gst = parseFloat(newProductGst) || 18;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      brand: recognitionResult?.extractedBrand || 'Retail',
      category: recognitionResult?.suggestedCategory || 'groceries',
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      hsn: newProductHsn.trim() || '2106',
      mrp: Math.round(price * 1.15),
      sellingPrice: price,
      gstRate: gst,
      stock: 50,
      unit: 'pcs',
      image: selectedImage || undefined,
      keywords: [
        ...newProductName.toLowerCase().split(/\s+/),
        recognitionResult?.extractedBrand?.toLowerCase() || '',
      ],
    };

    // Save to SQLite database
    await dbService.saveProduct(newProduct);

    // Add to bill
    onAddProductToCart(newProduct);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <Ionicons name="camera" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.headerTitle}>AI Snap & Bill</Text>
                <Text style={styles.headerSubtitle}>
                  Take a photo of product packaging to bill instantly
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Viewfinder / Capture Box */}
            <View style={styles.viewfinderContainer}>
              {selectedImage ? (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  {isAnalyzing && (
                    <View style={styles.scanningOverlay}>
                      <View style={styles.laserScanLine} />
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.scanningText}>
                        Scanning & Analyzing Product Packaging...
                      </Text>
                      <Text style={styles.scanningSubtext}>
                        Extracting Brand, Text & Matching SQLite Catalog
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyViewfinder}>
                  <View style={styles.reticleCornerTL} />
                  <View style={styles.reticleCornerTR} />
                  <View style={styles.reticleCornerBL} />
                  <View style={styles.reticleCornerBR} />

                  <Ionicons name="scan-outline" size={64} color="#6366F1" />
                  <Text style={styles.viewfinderPrompt}>
                    Frame product label or packaging in view
                  </Text>
                  <Text style={styles.viewfinderSubPrompt}>
                    Reads brand name, variant, net weight & looks up SQLite catalog
                  </Text>
                </View>
              )}
            </View>

            {/* Camera / Upload Action Bar */}
            <View style={styles.actionButtonBar}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Take Live Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <Ionicons name="images" size={20} color="#E2E8F0" />
                <Text style={styles.actionBtnSecondaryText}>Choose Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Demo Test Products Shelf */}
            <View style={styles.demoShelfSection}>
              <View style={styles.demoShelfHeader}>
                <Ionicons name="flash" size={16} color="#F59E0B" />
                <Text style={styles.demoShelfTitle}>
                  1-Tap Supermarket Test Shelf (Try Instant Snap)
                </Text>
              </View>
              <Text style={styles.demoShelfDesc}>
                Click any real grocery item below to test visual recognition & automated billing:
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.demoSamplesRow}
              >
                {DEMO_PRODUCT_SAMPLES.map((sample) => (
                  <TouchableOpacity
                    key={sample.id}
                    style={styles.demoSampleChip}
                    onPress={() => handleSelectDemoSample(sample)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: sample.sampleImageUrl }}
                      style={styles.demoSampleThumb}
                    />
                    <View style={styles.demoSampleInfo}>
                      <Text style={styles.demoSampleBrand}>{sample.brand}</Text>
                      <Text style={styles.demoSampleName} numberOfLines={1}>
                        {sample.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recognition Result Card */}
            {recognitionResult && !isAnalyzing && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultBadge}>
                    <Ionicons
                      name={
                        recognitionResult.bestMatch
                          ? 'checkmark-circle'
                          : 'alert-circle'
                      }
                      size={18}
                      color={
                        recognitionResult.bestMatch ? '#10B981' : '#F59E0B'
                      }
                    />
                    <Text
                      style={[
                        styles.resultBadgeText,
                        {
                          color: recognitionResult.bestMatch
                            ? '#10B981'
                            : '#F59E0B',
                        },
                      ]}
                    >
                      {recognitionResult.bestMatch
                        ? `${recognitionResult.bestMatch.confidenceScore}% Catalog Match Found!`
                        : 'New Product Detected'}
                    </Text>
                  </View>
                </View>

                {/* OCR Text Extracted Chip */}
                <View style={styles.ocrSnippetBox}>
                  <Text style={styles.ocrSnippetLabel}>Extracted Packaging Text:</Text>
                  <Text style={styles.ocrSnippetText} numberOfLines={2}>
                    "{recognitionResult.extractedText}"
                  </Text>
                </View>

                {/* If Match Found in SQLite */}
                {recognitionResult.bestMatch ? (
                  <View style={styles.matchedProductBox}>
                    <View style={styles.matchedProdRow}>
                      <Image
                        source={{
                          uri:
                            recognitionResult.bestMatch.product.image ||
                            selectedImage ||
                            '',
                        }}
                        style={styles.matchedProdImage}
                      />
                      <View style={styles.matchedProdDetails}>
                        <Text style={styles.matchedBrand}>
                          {recognitionResult.bestMatch.product.brand.toUpperCase()}
                        </Text>
                        <Text style={styles.matchedTitle}>
                          {recognitionResult.bestMatch.product.name}
                        </Text>
                        <View style={styles.matchedMetaRow}>
                          <Text style={styles.matchedGstTag}>
                            GST {recognitionResult.bestMatch.product.gstRate}%
                          </Text>
                          <Text style={styles.matchedHsn}>
                            HSN: {recognitionResult.bestMatch.product.hsn}
                          </Text>
                          <Text style={styles.matchedStock}>
                            Stock: {recognitionResult.bestMatch.product.stock}
                          </Text>
                        </View>
                        <Text style={styles.matchedPrice}>
                          {settings.currencySymbol}
                          {recognitionResult.bestMatch.product.sellingPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Instant Bill Action Button */}
                    <TouchableOpacity
                      style={styles.billNowBtn}
                      onPress={() =>
                        handleBillMatchedProduct(
                          recognitionResult.bestMatch!.product
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flash" size={20} color="#FFFFFF" />
                      <Text style={styles.billNowBtnText}>
                        ⚡ Add to Active Bill (
                        {settings.currencySymbol}
                        {recognitionResult.bestMatch.product.sellingPrice.toFixed(0)})
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* If New Product (Not yet in Catalog) */
                  <View style={styles.newProductBox}>
                    <Text style={styles.newProdTitle}>
                      Auto-Extract for New Product:
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Product Title</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newProductName}
                        onChangeText={setNewProductName}
                        placeholder="Enter product title"
                        placeholderTextColor="#64748B"
                      />
                    </View>

                    <View style={styles.inlineInputs}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.inputLabel}>Price ({settings.currencySymbol})</Text>
                        <TextInput
                          style={styles.textInput}
                          value={newProductPrice}
                          onChangeText={setNewProductPrice}
                          keyboardType="numeric"
                          placeholder="Price"
                          placeholderTextColor="#64748B"
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.inputLabel}>GST Slab (%)</Text>
                        <TextInput
                          style={styles.textInput}
                          value={newProductGst}
                          onChangeText={setNewProductGst}
                          keyboardType="numeric"
                          placeholder="GST %"
                          placeholderTextColor="#64748B"
                        />
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>HSN Code</Text>
                        <TextInput
                          style={styles.textInput}
                          value={newProductHsn}
                          onChangeText={setNewProductHsn}
                          placeholder="HSN"
                          placeholderTextColor="#64748B"
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.saveAndBillBtn}
                      onPress={handleSaveAndBillNewProduct}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                      <Text style={styles.saveAndBillBtnText}>
                        Save to SQLite & Bill Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  viewfinderContainer: {
    height: 220,
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    marginTop: 14,
    position: 'relative',
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  laserScanLine: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  scanningText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  scanningSubtext: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyViewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  reticleCornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6366F1',
  },
  reticleCornerTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6366F1',
  },
  reticleCornerBL: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#6366F1',
  },
  reticleCornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#6366F1',
  },
  viewfinderPrompt: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  viewfinderSubPrompt: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnSecondaryText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 13,
  },
  demoShelfSection: {
    backgroundColor: '#1E293B50',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#33415550',
  },
  demoShelfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoShelfTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  demoShelfDesc: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 8,
  },
  demoSamplesRow: {
    flexDirection: 'row',
  },
  demoSampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  demoSampleThumb: {
    width: 38,
    height: 38,
    borderRadius: 6,
  },
  demoSampleInfo: {
    maxWidth: 140,
  },
  demoSampleBrand: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
  },
  demoSampleName: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginTop: 14,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  ocrSnippetBox: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  ocrSnippetLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ocrSnippetText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  matchedProductBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  matchedProdRow: {
    flexDirection: 'row',
    gap: 12,
  },
  matchedProdImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  matchedProdDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  matchedBrand: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  matchedTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  matchedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  matchedGstTag: {
    backgroundColor: '#064E3B',
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  matchedHsn: {
    color: '#94A3B8',
    fontSize: 10,
  },
  matchedStock: {
    color: '#94A3B8',
    fontSize: 10,
  },
  matchedPrice: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  billNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  billNowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  newProductBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  newProdTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  inlineInputs: {
    flexDirection: 'row',
  },
  saveAndBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  saveAndBillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
