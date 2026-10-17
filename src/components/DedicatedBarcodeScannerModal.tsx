import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../theme/colors';

interface DedicatedBarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  subtitle?: string;
}

export const DedicatedBarcodeScannerModal: React.FC<DedicatedBarcodeScannerModalProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Scan Barcode / QR Code',
  subtitle = 'Align barcode or QR code within frame for instant scan',
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [manualCode, setManualCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [scanAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setManualCode('');
      // Laser scan line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, scanAnim]);

  if (!visible) return null;

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);
    onScan(data.trim());
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    onClose();
  };

  const laserTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 190],
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Top Controls Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconCircle}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.topTitle}>{title}</Text>
            <Text style={styles.topSubtitle}>{subtitle}</Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => setTorchOn((prev) => !prev)}
              style={[styles.iconCircle, torchOn && { backgroundColor: COLORS.secondary }]}
            >
              <Ionicons
                name={torchOn ? 'flash' : 'flash-off-outline'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              style={styles.iconCircle}
            >
              <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Scanner Viewport */}
        <View style={styles.cameraContainer}>
          {!permission?.granted ? (
            <View style={styles.permissionBox}>
              <Ionicons name="camera-outline" size={54} color={COLORS.secondary} />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionDesc}>
                DigiKart POS requires camera permission to scan product barcodes and QR codes continuously.
              </Text>
              <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torchOn}
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
              {/* Dark Cutout Overlay */}
              <View style={styles.overlayLayer}>
                {/* Aiming Reticle Frame */}
                <View style={styles.viewfinderBox}>
                  {/* Glowing Reticle Corner Accents */}
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />

                  {/* Red / Green Laser Scan Line */}
                  <Animated.View
                    style={[
                      styles.laserLine,
                      {
                        transform: [{ translateY: laserTranslateY }],
                        backgroundColor: scanned ? '#10B981' : '#EF4444',
                      },
                    ]}
                  />

                  {scanned && (
                    <View style={styles.scannedSuccessBadge}>
                      <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                      <Text style={styles.scannedSuccessText}>Barcode Captured!</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modeTagsRow}>
                  <View style={styles.tagBadge}>
                    <Ionicons name="barcode-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.tagText}>1D Barcodes (EAN, UPC, Code 128)</Text>
                  </View>
                  <View style={[styles.tagBadge, { backgroundColor: 'rgba(255, 102, 0, 0.85)' }]}>
                    <Ionicons name="qr-code-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.tagText}>2D QR Codes</Text>
                  </View>
                </View>
              </View>
            </CameraView>
          )}
        </View>

        {/* Bottom Manual Barcode Entry Fallback */}
        <View style={styles.bottomBar}>
          <Text style={styles.bottomLabel}>Or Type Barcode Digits Manually:</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="barcode-outline" size={22} color={COLORS.secondary} />
            <TextInput
              style={styles.textInput}
              value={manualCode}
              onChangeText={setManualCode}
              onSubmitEditing={handleManualSubmit}
              placeholder="e.g. 8906021123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              returnKeyType="done"
            />
            {manualCode.length > 0 && (
              <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 44,
    paddingBottom: 14,
    backgroundColor: 'rgba(10, 37, 64, 0.95)',
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
  },
  permissionDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  grantBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  overlayLayer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderBox: {
    width: 270,
    height: 200,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: COLORS.secondary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  laserLine: {
    height: 3,
    width: '100%',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  scannedSuccessBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  scannedSuccessText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  modeTagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 37, 64, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomLabel: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  submitBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
