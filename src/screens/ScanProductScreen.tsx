import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../components/AppHeader';
import { COLORS } from '../theme/colors';
import { Product } from '../types';

interface ScanProductScreenProps {
  onBack: () => void;
  onPhotoCaptured: (imageUri: string, manualProduct?: Product, barcode?: string) => void;
  onBarcodeScanned?: (barcode: string) => void;
  availableProducts: Product[];
}

export const ScanProductScreen: React.FC<ScanProductScreenProps> = ({
  onBack,
  onPhotoCaptured,
  onBarcodeScanned,
  availableProducts,
}) => {
  const [scanMode, setScanMode] = useState<'PHOTO' | 'BARCODE'>('PHOTO');
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [previewProduct, setPreviewProduct] = useState<Product>(availableProducts[0]);
  const [barcodeInput, setBarcodeInput] = useState(availableProducts[0]?.barcode || '');

  // Gallery upload: upload any image to identify product via OCR
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        onPhotoCaptured(uri, undefined, undefined);
        return;
      }
    } catch (err) {
      console.warn('Gallery pick error, fallback to simulated photo:', err);
    }
    onPhotoCaptured(previewProduct.image || '', previewProduct, undefined);
  };

  // Live Camera capture for Photo OCR
  const handleLiveCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          onPhotoCaptured(uri, undefined, undefined);
          return;
        }
      }
    } catch (err) {
      console.warn('Camera capture fallback:', err);
    }

    // Default to photo captured of product
    onPhotoCaptured(previewProduct.image || '', previewProduct, undefined);
  };

  // DIRECT BARCODE SCANNING (Does NOT open OCR!)
  const handleBarcodeSubmit = (customCode?: string) => {
    const code = (customCode || barcodeInput || previewProduct.barcode).trim();
    if (!code) {
      Alert.alert('Barcode Scanner', 'Please enter or scan a barcode number.');
      return;
    }
    if (onBarcodeScanned) {
      onBarcodeScanned(code);
    } else {
      // Fallback direct match without OCR
      const matched = availableProducts.find((p) => p.barcode === code);
      if (matched) {
        onPhotoCaptured(matched.image || '', matched, code);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 2 Header */}
      <AppHeader
        title={scanMode === 'PHOTO' ? 'Scan Product' : 'Barcode Scanner'}
        showBack={true}
        onBack={onBack}
        rightIcon={flashOn ? 'flash' : 'flash-outline'}
        onRightPress={() => setFlashOn((prev) => !prev)}
      />

      {/* Dual Mode Switcher Bar */}
      <View style={styles.modeSwitcherBar}>
        <TouchableOpacity
          style={[styles.modeTab, scanMode === 'PHOTO' && styles.modeTabActive]}
          onPress={() => setScanMode('PHOTO')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="camera-outline"
            size={16}
            color={scanMode === 'PHOTO' ? '#FFFFFF' : '#94A3B8'}
          />
          <Text style={[styles.modeTabText, scanMode === 'PHOTO' && styles.modeTabTextActive]}>
            Photo OCR Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, scanMode === 'BARCODE' && styles.modeTabActive]}
          onPress={() => setScanMode('BARCODE')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="barcode-outline"
            size={16}
            color={scanMode === 'BARCODE' ? '#FFFFFF' : '#94A3B8'}
          />
          <Text style={[styles.modeTabText, scanMode === 'BARCODE' && styles.modeTabTextActive]}>
            Auto Barcode Scan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera Viewfinder Viewport */}
      <View style={styles.viewfinderContainer}>
        {/* Background / Product Preview in Frame */}
        {previewProduct.image ? (
          <Image
            source={{ uri: previewProduct.image }}
            style={styles.cameraFeedImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.blankFeed}>
            <Ionicons name="camera-outline" size={64} color="#94A3B8" />
          </View>
        )}

        {/* Darkened overlay mask with clear center reticle */}
        <View style={styles.maskContainer}>
          {scanMode === 'PHOTO' ? (
            <View style={styles.reticleFrame}>
              {/* 4 Glowing Corner Brackets matching Screen 2 */}
              <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              <View style={[styles.cornerBracket, styles.topRightBracket]} />
              <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
            </View>
          ) : (
            /* Barcode Linear Reticle */
            <View style={styles.barcodeReticle}>
              <View style={styles.laserRedLine} />
              <Text style={styles.barcodeInstructionText}>
                Align barcode line within the laser
              </Text>
            </View>
          )}

          {/* Prompt banner matching Screen 2 */}
          <View style={styles.instructionPill}>
            <Text style={styles.instructionText}>
              {scanMode === 'PHOTO'
                ? 'Align the product within the frame'
                : 'Point camera at product barcode'}
            </Text>
          </View>
        </View>

        {/* Quick Barcode Direct Input in Barcode Mode */}
        {scanMode === 'BARCODE' && (
          <View style={styles.barcodeInputCard}>
            <TextInput
              style={styles.barcodeInputField}
              placeholder="Or type Barcode (e.g. 8906021123456)"
              placeholderTextColor="#94A3B8"
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.barcodeGoBtn} onPress={() => handleBarcodeSubmit()}>
              <Text style={styles.barcodeGoText}>Lookup</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Product Switcher for testing retail packages */}
        <View style={styles.quickSamplesRow}>
          <Text style={styles.sampleLabel}>
            {scanMode === 'PHOTO' ? 'PHOTO SAMPLES:' : 'BARCODE SAMPLES:'}
          </Text>
          {availableProducts.slice(0, 4).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.sampleChip,
                previewProduct.id === p.id && styles.sampleChipActive,
              ]}
              onPress={() => {
                setPreviewProduct(p);
                setBarcodeInput(p.barcode);
                if (scanMode === 'BARCODE') {
                  // Direct barcode scan without OCR!
                  handleBarcodeSubmit(p.barcode);
                }
              }}
            >
              <Text
                style={[
                  styles.sampleChipText,
                  previewProduct.id === p.id && styles.sampleChipTextActive,
                ]}
                numberOfLines={1}
              >
                {p.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Special Chip: New Unknown Item (Tests "Name Not Found -> Add Name for New Product") */}
          {scanMode === 'PHOTO' && (
            <TouchableOpacity
              style={[styles.sampleChip, styles.newSampleChip]}
              onPress={() => {
                onPhotoCaptured('assets/unknown_retail_pack.jpg', undefined, undefined);
              }}
            >
              <Ionicons name="sparkles" size={12} color="#F59E0B" />
              <Text style={styles.newSampleChipText}>+ New Product</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Controls Bar matching Screen 2 */}
      <View style={styles.bottomControls}>
        {/* Gallery / File Upload */}
        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={handlePickFromGallery}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Large Shutter Button */}
        <TouchableOpacity
          style={styles.shutterOuterRing}
          onPress={scanMode === 'PHOTO' ? handleLiveCameraCapture : () => handleBarcodeSubmit()}
          activeOpacity={0.8}
        >
          <View style={styles.shutterInnerCircle} />
        </TouchableOpacity>

        {/* Switch Camera */}
        <TouchableOpacity
          style={styles.switchCamBtn}
          onPress={() =>
            setCameraFacing((f) => (f === 'back' ? 'front' : 'back'))
          }
          activeOpacity={0.7}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modeSwitcherBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  viewfinderContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1E1E2E',
    overflow: 'hidden',
  },
  cameraFeedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  blankFeed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  maskContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  reticleFrame: {
    width: '78%',
    height: '56%',
    position: 'relative',
  },
  barcodeReticle: {
    width: '80%',
    height: 120,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  laserRedLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#EF4444',
  },
  barcodeInstructionText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 10,
    fontWeight: '600',
  },
  cornerBracket: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#FFFFFF',
  },
  topLeftBracket: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRightBracket: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeftBracket: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRightBracket: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  instructionPill: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  barcodeInputCard: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    gap: 8,
  },
  barcodeInputField: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  barcodeGoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeGoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  quickSamplesRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  sampleLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
  },
  sampleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sampleChipActive: {
    backgroundColor: COLORS.primary,
  },
  sampleChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  sampleChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  newSampleChip: {
    backgroundColor: '#78350F',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  newSampleChipText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomControls: {
    height: 105,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  switchCamBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
