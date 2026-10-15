import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Brand Header matching Image 2 Screen 1 */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="cart" size={38} color={COLORS.primary} />
          </View>
          <Text style={styles.brandTitle}>DigiKart POS</Text>
          <Text style={styles.brandSubtitle}>Retail Billing Made Simple</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Checkboxes Row */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showPassword ? 'checkbox' : 'square-outline'}
              size={18}
              color={showPassword ? COLORS.primary : '#94A3B8'}
            />
            <Text style={styles.checkboxLabel}>Show password</Text>
          </TouchableOpacity>

          <View style={styles.rememberForgotRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={18}
                color={rememberMe ? COLORS.primary : '#94A3B8'}
              />
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={onLoginSuccess}
            activeOpacity={0.8}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerVersion}>v1.0.0 | DigiKart POS</Text>
          <Text style={styles.footerTagline}>
            Simple Billing • Stock • Reports • GST
          </Text>
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
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.card,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  checkboxLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.card,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  footerTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
