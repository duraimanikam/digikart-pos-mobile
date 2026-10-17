import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { Invoice, ShopSettings } from '../types';
import { receiptService } from '../services/receiptService';
import {
  bluetoothPrinterService,
  BluetoothDeviceInfo,
} from '../services/bluetoothPrinterService';

interface PrintOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  settings: ShopSettings;
}

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({
  visible,
  onClose,
  invoice,
  settings,
}) => {
  const [printMode, setPrintMode] = useState<'BLUETOOTH' | 'WIFI'>('BLUETOOTH');
  const [bluetoothPrinters] = useState<BluetoothDeviceInfo[]>(() =>
    bluetoothPrinterService.getPairedPrinters()
  );
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDeviceInfo>(() =>
    bluetoothPrinterService.getConnectedDevice()
  );
  const [protocol, setProtocol] = useState<'ESC_POS' | 'TSC'>('ESC_POS');
  const [paperWidth, setPaperWidth] = useState<58 | 80>(80);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!invoice) return null;

  // Wi-Fi / LAN Printer: Uses system network print spooler
  const handlePrintWifiA4 = async () => {
    setIsPrinting(true);
    setPrintStatus('Generating A4 GST Tax Invoice for Wi-Fi Printer...');
    try {
      const res = await receiptService.printA4Wifi(invoice, settings);
      setIsPrinting(false);
      setPrintStatus(null);
      if (res.success) {
        Alert.alert(
          'Wi-Fi Printer Prepared',
          `Full A4 GST Tax Invoice #${invoice.invoiceNo} sent to Wi-Fi / Network printer.`
        );
        onClose();
      }
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Print Error', err?.message || 'Failed to print via Wi-Fi');
    }
  };

  // Bluetooth Printer: Direct ESC/POS or TSC TSPL byte streaming WITHOUT Wi-Fi dialog
  const handlePrintBluetoothDirect = async () => {
    setIsPrinting(true);
    setPrintStatus(`Connecting to ${selectedDevice.name} via Bluetooth...`);

    setTimeout(async () => {
      try {
        setPrintStatus(`Streaming ${protocol} binary commands to ${selectedDevice.name}...`);
        const result = await bluetoothPrinterService.printThermalDirect(
          invoice,
          settings,
          selectedDevice,
          protocol,
          paperWidth
        );

        setIsPrinting(false);
        setPrintStatus(null);

        Alert.alert(
          '🖨️ Bluetooth Print Successful',
          `Sent ${result.byteCount} bytes of ${protocol} commands to ${selectedDevice.name} (${paperWidth}mm).\n\nMode: ${
            protocol === 'TSC' ? 'TSC TSPL Barcode Label' : 'ESC/POS Receipt Roll'
          }`,
          [{ text: 'OK', onPress: onClose }]
        );
      } catch (err: any) {
        setIsPrinting(false);
        setPrintStatus(null);
        Alert.alert('Bluetooth Error', err?.message || 'Failed to stream to Bluetooth printer');
      }
    }, 700);
  };

  const handleShareA4Pdf = async () => {
    setIsPrinting(true);
    setPrintStatus('Creating A4 GST Invoice PDF...');
    try {
      await receiptService.shareInvoicePdf(invoice, settings, 'a4');
      setIsPrinting(false);
      setPrintStatus(null);
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Share Error', err?.message || 'Failed to share PDF');
    }
  };

  const handleShareThermalPdf = async () => {
    setIsPrinting(true);
    setPrintStatus('Creating Thermal Slip PDF...');
    try {
      await receiptService.shareInvoicePdf(invoice, settings, 'thermal');
      setIsPrinting(false);
      setPrintStatus(null);
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Share Error', err?.message || 'Failed to share PDF');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <View style={styles.printerIconCircle}>
                <Ionicons name="print" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Print Bill #{invoice.invoiceNo}</Text>
                <Text style={styles.headerSubtitle}>
                  Select your dedicated printer type below
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                printMode === 'BLUETOOTH' && styles.tabBtnActive,
              ]}
              onPress={() => setPrintMode('BLUETOOTH')}
            >
              <Ionicons
                name="bluetooth"
                size={18}
                color={printMode === 'BLUETOOTH' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  printMode === 'BLUETOOTH' && styles.tabBtnTextActive,
                ]}
              >
                Bluetooth Thermal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                printMode === 'WIFI' && styles.tabBtnActive,
              ]}
              onPress={() => setPrintMode('WIFI')}
            >
              <Ionicons
                name="wifi"
                size={18}
                color={printMode === 'WIFI' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  printMode === 'WIFI' && styles.tabBtnTextActive,
                ]}
              >
                Wi-Fi (A4 GST)
              </Text>
            </TouchableOpacity>
          </View>

          {isPrinting ? (
            <View style={styles.printingStateBox}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.printingStateText}>{printStatus}</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollBody}
              showsVerticalScrollIndicator={false}
            >
              {printMode === 'BLUETOOTH' ? (
                /* --- DEDICATED BLUETOOTH PRINTER SECTION --- */
                <View style={styles.bluetoothSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>Paired Bluetooth Printers:</Text>
                    <View style={styles.onlineBadge}>
                      <View style={styles.greenDot} />
                      <Text style={styles.onlineBadgeText}>Bluetooth Ready</Text>
                    </View>
                  </View>

                  {/* List of Dedicated Bluetooth Printers */}
                  <View style={styles.deviceList}>
                    {bluetoothPrinters.map((dev) => {
                      const isSelected = selectedDevice.id === dev.id;
                      return (
                        <TouchableOpacity
                          key={dev.id}
                          style={[
                            styles.deviceCard,
                            isSelected && styles.deviceCardSelected,
                          ]}
                          onPress={() => {
                            setSelectedDevice(dev);
                            setPaperWidth(dev.paperWidth);
                            setProtocol(dev.type);
                          }}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.deviceIconCircle,
                              isSelected && { backgroundColor: COLORS.secondary },
                            ]}
                          >
                            <Ionicons
                              name="bluetooth"
                              size={20}
                              color={isSelected ? '#FFFFFF' : '#64748B'}
                            />
                          </View>
                          <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>{dev.name}</Text>
                            <Text style={styles.deviceSub}>
                              {dev.type === 'TSC' ? 'TSC TSPL (Label/Sticker)' : 'ESC/POS (Thermal Receipt)'} • {dev.paperWidth}mm
                            </Text>
                          </View>
                          <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={22}
                            color={isSelected ? COLORS.secondary : '#CBD5E1'}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Protocol Selector: ESC/POS vs TSC TSPL */}
                  <View style={styles.configBlock}>
                    <Text style={styles.configLabel}>Thermal Command Set:</Text>
                    <View style={styles.pillRow}>
                      <TouchableOpacity
                        style={[
                          styles.pill,
                          protocol === 'ESC_POS' && styles.pillActive,
                        ]}
                        onPress={() => setProtocol('ESC_POS')}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            protocol === 'ESC_POS' && styles.pillTextActive,
                          ]}
                        >
                          ESC/POS (Standard Receipt)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.pill,
                          protocol === 'TSC' && styles.pillActive,
                        ]}
                        onPress={() => setProtocol('TSC')}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            protocol === 'TSC' && styles.pillTextActive,
                          ]}
                        >
                          TSC TSPL (Barcode Label)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Roll Width Selector */}
                  <View style={styles.configBlock}>
                    <Text style={styles.configLabel}>Paper Width:</Text>
                    <View style={styles.pillRow}>
                      <TouchableOpacity
                        style={[
                          styles.pill,
                          paperWidth === 80 && styles.pillActive,
                        ]}
                        onPress={() => setPaperWidth(80)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            paperWidth === 80 && styles.pillTextActive,
                          ]}
                        >
                          80 mm (3-inch Roll)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.pill,
                          paperWidth === 58 && styles.pillActive,
                        ]}
                        onPress={() => setPaperWidth(58)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            paperWidth === 58 && styles.pillTextActive,
                          ]}
                        >
                          58 mm (2-inch Roll)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Action Print Button */}
                  <TouchableOpacity
                    style={styles.primaryPrintBtn}
                    onPress={handlePrintBluetoothDirect}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryPrintBtnText}>
                      Print to {selectedDevice.name.split(' ')[0]} (Bluetooth)
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* --- WI-FI / NETWORK A4 GST SECTION --- */
                <View style={styles.wifiSection}>
                  <View style={styles.wifiCard}>
                    <View style={styles.wifiHeader}>
                      <View style={styles.wifiIconBox}>
                        <Ionicons name="document-text" size={28} color="#0284C7" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.wifiTitle}>A4 Statutory GST Tax Invoice</Text>
                        <Text style={styles.wifiSubtitle}>
                          Standard GST Section 31 A4 Invoice with HSN breakdown, CGST, SGST, bank details & seal.
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryPrintBtn, { backgroundColor: '#0284C7' }]}
                      onPress={handlePrintWifiA4}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="print" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryPrintBtnText}>Print A4 via Wi-Fi / LAN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Share PDF Fallbacks */}
              <View style={styles.shareSection}>
                <Text style={styles.shareTitle}>Quick Share:</Text>
                <View style={styles.shareRow}>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={handleShareA4Pdf}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.shareBtnText}>Share A4 PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={handleShareThermalPdf}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="receipt-outline" size={18} color={COLORS.secondary} />
                    <Text style={[styles.shareBtnText, { color: COLORS.secondary }]}>
                      Share Thermal PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    ...SHADOWS.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  printerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A2540',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bluetoothSection: {
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2540',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  deviceList: {
    gap: 8,
    marginBottom: 14,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  deviceCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#FFF7F2',
  },
  deviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  deviceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  configBlock: {
    marginBottom: 14,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: COLORS.secondary,
    backgroundColor: '#FFF2EB',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  primaryPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
    ...SHADOWS.card,
  },
  primaryPrintBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  wifiSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  wifiCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  wifiHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  wifiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
  },
  wifiSubtitle: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 3,
    lineHeight: 16,
  },
  shareSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  shareTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  printingStateBox: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  printingStateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A2540',
    textAlign: 'center',
  },
});
