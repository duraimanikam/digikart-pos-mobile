import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';
import { VoiceItemEntryModal, VoiceParsedItem } from '../components/VoiceItemEntryModal';

interface ScanProductScreenProps {
  onBack: () => void;
  onPhotoCaptured?: (imageUri: string, manualProduct?: Product, barcode?: string) => void;
  onBarcodeScanned?: (barcode: string) => void;
  availableProducts: Product[];
}

export const ScanProductScreen: React.FC<ScanProductScreenProps> = ({
  onBack,
  onBarcodeScanned,
  availableProducts,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanned, setScanned] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [scanAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Laser sweep animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);

    const code = data.trim();
    if (onBarcodeScanned) {
      onBarcodeScanned(code);
    } else {
      Alert.alert('Scanned', `Barcode: ${code}`);
    }

    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const handleManualSubmit = () => {
    const code = barcodeInput.trim();
    if (!code) {
      Alert.alert('Barcode Scanner', 'Please enter a barcode number.');
      return;
    }
    if (onBarcodeScanned) {
      onBarcodeScanned(code);
    }
  };

  const handleVoiceItemConfirmed = (item: VoiceParsedItem) => {
    // Look up product by name or add
    const matched = availableProducts.find(
      (p) =>
        p.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matched && onBarcodeScanned) {
      onBarcodeScanned(matched.barcode);
    } else if (onBarcodeScanned) {
      // Use fallback barcode
      onBarcodeScanned(`VOICE-${Date.now().toString().slice(-6)}`);
    }
  };

  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 210],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen Header */}
      <AppHeader
        title="Barcode & QR Scanner"
        subtitle="Point camera at product barcode"
        showBack={true}
        onBack={onBack}
        rightIcon={flashOn ? 'flash' : 'flash-outline'}
        onRightPress={() => setFlashOn((prev) => !prev)}
        secondRightIcon="camera-reverse-outline"
        onSecondRightPress={() => setCameraFacing((f) => (f === 'back' ? 'front' : 'back'))}
      />

      {/* Live Viewfinder Area */}
      <View style={styles.scannerWrapper}>
        {!permission?.granted ? (
          <View style={styles.permissionBox}>
            <View style={styles.permIconCircle}>
              <Ionicons name="barcode-outline" size={48} color={COLORS.secondary} />
            </View>
            <Text style={styles.permTitle}>Camera Scanner Permission</Text>
            <Text style={styles.permDesc}>
              DigiKart POS uses real-time hardware scanning to instantly detect EAN-13, UPC, Code 128, and QR codes without taking photos.
            </Text>
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Enable Camera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={cameraFacing}
            enableTorch={flashOn}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'code128',
                'code39',
                'upc_a',
                'upc_e',
                'codabar',
                'itf14',
              ],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          >
            {/* Dark Mask with Clear Window */}
            <View style={styles.overlay}>
              <View style={styles.reticleFrame}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />

                {/* Animated Red/Green Laser Beam */}
                <Animated.View
                  style={[
                    styles.laserBeam,
                    {
                      transform: [{ translateY: laserTranslateY }],
                      backgroundColor: scanned ? '#10B981' : '#EF4444',
                    },
                  ]}
                />

                {scanned && (
                  <View style={styles.successBadge}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                    <Text style={styles.successText}>Code Scanned!</Text>
                  </View>
                )}
              </View>

              <Text style={styles.aimInstruction}>
                Auto-Scanning 1D Barcodes & 2D QR Codes
              </Text>
            </View>
          </CameraView>
        )}
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomBar}>
        {/* Voice Entry Shortcut */}
        <TouchableOpacity
          style={styles.voiceEntryBtn}
          onPress={() => setIsVoiceModalOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.voiceIconCircle}>
            <Ionicons name="mic" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.voiceTitle}>Voice to Item Entry</Text>
            <Text style={styles.voiceSub}>Speak item name & qty instead of scanning</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Manual Barcode Input */}
        <View style={styles.manualInputGroup}>
          <Text style={styles.manualLabel}>Manual Barcode Digits:</Text>
          <View style={styles.manualInputWrapper}>
            <Ionicons name="barcode-outline" size={20} color={COLORS.secondary} />
            <TextInput
              style={styles.manualInput}
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              onSubmitEditing={handleManualSubmit}
              placeholder="e.g. 8906021123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              returnKeyType="done"
            />
            {barcodeInput.length > 0 && (
              <TouchableOpacity style={styles.addBtn} onPress={handleManualSubmit}>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Voice Item Entry Modal */}
      <VoiceItemEntryModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onItemConfirmed={handleVoiceItemConfirmed}
        title="Voice Item Entry"
        targetScreen="billing"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  scannerWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 102, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  permDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  permBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleFrame: {
    width: 280,
    height: 220,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.secondary,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserBeam: {
    height: 3,
    width: '100%',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 4,
  },
  successBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  aimInstruction: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    backgroundColor: 'rgba(10, 37, 64, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    ...SHADOWS.floating,
  },
  voiceEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD8C2',
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  voiceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0A2540',
  },
  voiceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  manualInputGroup: {},
  manualLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  manualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  manualInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
