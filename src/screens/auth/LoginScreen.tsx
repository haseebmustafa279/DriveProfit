/**
 * Login Screen
 * Handles user authentication
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { validateLoginCredentials } from '../../utils/validation';
import { LoginCredentials } from '../../types/auth';
import { PasswordInput } from '../../components/common/PasswordInput';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setValidationError(null);

    // Validate inputs
    const validation = validateLoginCredentials(email, password);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setLocalLoading(true);

    try {
      const credentials: LoginCredentials = {
        email: email.trim(),
        password,
      };

      await login(credentials);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || state.isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.appTitle} accessibilityRole="header">DriveProfit</Text>
          <Text style={styles.appSubtitle}>Income &amp; Expense Management</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle} accessibilityRole="header">Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, validationError && styles.inputError]}
              accessibilityLabel="Email"
              placeholder="Enter your email"
              placeholderTextColor={COLORS.hintText}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <PasswordInput
              inputStyle={[styles.input, validationError && styles.inputError]}
              accessibilityLabel="Password"
              placeholder="Enter your password"
              placeholderTextColor={COLORS.hintText}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          {validationError && (
            <View style={styles.errorContainer} accessibilityRole="alert">
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {state.error && (
            <View style={styles.errorContainer} accessibilityRole="alert">
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
            activeOpacity={0.82}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.lightBg} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreateAccount')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerSection: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.mediumText,
    textAlign: 'center',
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  formSection: {
    width: '100%',
    maxWidth: 440,
    gap: SPACING.md,
  },
  inputContainer: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.darkText,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.darkText,
    backgroundColor: COLORS.cardBg,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
  linkButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
});
