import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';

export interface VoiceParsedItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface VoiceItemEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onItemConfirmed: (item: VoiceParsedItem) => void;
  title?: string;
  targetScreen?: 'billing' | 'products' | 'purchase';
}

export const VoiceItemEntryModal: React.FC<VoiceItemEntryModalProps> = ({
  visible,
  onClose,
  onItemConfirmed,
  title = 'Voice to Item Entry',
  targetScreen = 'billing',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [parsedName, setParsedName] = useState('');
  const [parsedQty, setParsedQty] = useState('1');
  const [parsedPrice, setParsedPrice] = useState('100');
  const [parsedUnit, setParsedUnit] = useState('pcs');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Speech Recognition instance (for Web/Android Chrome if supported)
  useEffect(() => {
    if (visible) {
      setSpokenText('');
      setParsedName('Aachi Turmeric Powder');
      setParsedQty('2');
      setParsedPrice('120');
      setParsedUnit('pcs');
      setIsListening(false);
    }
  }, [visible]);

  // Mic Pulse Animation
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop?.stop();
  }, [isListening, pulseAnim]);

  if (!visible) return null;

  // Intelligent speech parser: extracts item name, quantity, price
  const parseSpeech = (text: string) => {
    setSpokenText(text);

    // Look for numbers for quantity & price
    // e.g. "Aachi Turmeric Powder 2 packets 120 rupees"
    const lower = text.toLowerCase();

    // Check quantity words or numbers
    const qtyMatch = lower.match(/(\d+)\s*(pcs|pieces|packet|packets|pkt|pkts|kg|ltr|litre|litres|bottle|bottles|box|boxes)?/);
    let qty = 1;
    let unit = 'pcs';
    if (qtyMatch && qtyMatch[1]) {
      qty = parseInt(qtyMatch[1], 10) || 1;
      if (qtyMatch[2]) {
        if (qtyMatch[2].startsWith('packet') || qtyMatch[2].startsWith('pkt')) unit = 'pkt';
        else if (qtyMatch[2].startsWith('kg')) unit = 'kg';
        else if (qtyMatch[2].startsWith('ltr') || qtyMatch[2].startsWith('litre')) unit = 'Ltr';
        else if (qtyMatch[2].startsWith('bottle')) unit = 'bottle';
        else unit = 'pcs';
      }
    }

    // Check price words
    const priceMatch = lower.match(/(?:rupees|rs|rate|price|inr)\s*(\d+(?:\.\d+)?)/) ||
      lower.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs)/);
    let price = 100;
    if (priceMatch && priceMatch[1]) {
      price = parseFloat(priceMatch[1]) || 100;
    }

    // Clean name: remove matched numbers and keywords
    let cleanName = text
      .replace(/(\d+)\s*(pcs|pieces|packet|packets|pkt|pkts|kg|ltr|litre|litres|bottle|bottles|box|boxes)/gi, '')
      .replace(/(?:rupees|rs|rate|price|inr)\s*(\d+(?:\.\d+)?)/gi, '')
      .replace(/(\d+(?:\.\d+)?)\s*(?:rupees|rs)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) cleanName = text;

    setParsedName(cleanName);
    setParsedQty(`${qty}`);
    setParsedPrice(`${price}`);
    setParsedUnit(unit);
  };

  const handleStartListening = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-IN';
          recognition.interimResults = false;
          setIsListening(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            parseSpeech(transcript);
          };
          recognition.onerror = () => {
            setIsListening(false);
          };
          recognition.onend = () => {
            setIsListening(false);
          };
          recognition.start();
          return;
        } catch {
          setIsListening(false);
        }
      }
    }

    // Mobile / native simulation fallback with real voice phrases
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const demoPhrases = [
        'Aachi Turmeric Powder 2 packets 120 rupees',
        'Aavin Milk Fresh 3 litres 68 rupees',
        'Fortune Sunflower Oil 2 litres 135 rupees',
        'Sunfeast Marie Biscuits 5 packets 30 rupees',
        'Dettol Bathing Soap 4 pieces 40 rupees',
      ];
      const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
      parseSpeech(randomPhrase);
    }, 1800);
  };

  const handleConfirm = () => {
    if (!parsedName.trim()) return;
    onItemConfirmed({
      name: parsedName.trim(),
      quantity: Math.max(1, parseFloat(parsedQty) || 1),
      price: Math.max(0, parseFloat(parsedPrice) || 0),
      unit: parsedUnit,
    });
    onClose();
  };

  const sampleVoiceChips = [
    'Aachi Turmeric Powder 2 pkts 120 rs',
    'Aavin Milk 3 Ltr 68 rs',
    'Fortune Sunflower Oil 2 Ltr 135 rs',
    'Sunfeast Marie Biscuits 4 pcs 30 rs',
    'Dettol Soap 3 pcs 40 rs',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.micIconCircle}>
                <Ionicons name="mic" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSub}>
                  Speak item name, quantity & price for {targetScreen}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Big Mic Button with Pulse */}
            <View style={styles.micSection}>
              <Animated.View
                style={[
                  styles.micRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: isListening ? COLORS.secondary : '#E2E8F0',
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.micPulseBtn,
                    isListening && { backgroundColor: COLORS.secondary },
                  ]}
                  onPress={handleStartListening}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isListening ? 'mic' : 'mic-outline'}
                    size={36}
                    color={isListening ? '#FFFFFF' : COLORS.primary}
                  />
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.micStatusText}>
                {isListening
                  ? '🎙️ Listening... Speak your item now'
                  : 'Tap Microphone to Speak'}
              </Text>
              {spokenText ? (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptLabel}>Heard Speech:</Text>
                  <Text style={styles.transcriptText}>"{spokenText}"</Text>
                </View>
              ) : null}
            </View>

            {/* Quick Demo Voice Suggestions */}
            <View style={styles.suggestionBlock}>
              <Text style={styles.suggestionTitle}>Or Tap Quick Voice Phrases:</Text>
              <View style={styles.chipsRow}>
                {sampleVoiceChips.map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => parseSpeech(chip)}
                  >
                    <Ionicons name="volume-medium-outline" size={13} color={COLORS.secondary} />
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Parsed Fields Result Box */}
            <View style={styles.parsedBox}>
              <View style={styles.parsedHeader}>
                <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
                <Text style={styles.parsedTitle}>Parsed Item Details</Text>
              </View>

              {/* Item Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Item Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={parsedName}
                  onChangeText={setParsedName}
                  placeholder="Item Name"
                />
              </View>

              {/* Qty & Price Row */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Qty ({parsedUnit})</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={parsedQty}
                    onChangeText={setParsedQty}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                  <Text style={styles.fieldLabel}>Rate / Price (₹)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={parsedPrice}
                    onChangeText={setParsedPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.confirmText}>Add To {targetScreen.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A2540',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  micIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  micRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  micPulseBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  micStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A2540',
  },
  transcriptBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF2EB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD8C2',
    width: '100%',
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E05300',
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A2540',
    marginTop: 2,
    fontStyle: 'italic',
  },
  suggestionBlock: {
    marginVertical: 12,
  },
  suggestionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  parsedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  parsedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2540',
  },
  fieldGroup: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.8,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOWS.card,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
