import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { validateRegistration } from '../../utils/validation';
import { PasswordInput } from '../../components/common/PasswordInput';

export const CreateAccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, state } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleCreateAccount = async () => {
    setValidationError(null);
    const validation = validateRegistration(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setLocalLoading(true);
    try {
      await register(name, email, password);
    } catch {
      // The auth state error below contains the user-facing Firebase message.
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
          <View style={styles.formHeading}>
            <Text style={styles.formTitle} accessibilityRole="header">Create Account</Text>
            <Text style={styles.formSubtitle}>Start using DriveProfit</Text>
          </View>

          <Input label="Name" value={name} onChangeText={setName} placeholder="Enter your name" disabled={isLoading} returnKeyType="next" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" disabled={isLoading} email returnKeyType="next" />
          <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" disabled={isLoading} returnKeyType="next" />
          <PasswordField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your password" disabled={isLoading} returnKeyType="done" />

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
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
            activeOpacity={0.82}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            accessibilityState={{ disabled: isLoading }}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  email?: boolean;
  secure?: boolean;
  returnKeyType?: 'next' | 'done';
};

const Input: React.FC<InputProps> = ({ label, value, onChangeText, placeholder, disabled, email, secure, returnKeyType }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      accessibilityLabel={label}
      placeholder={placeholder}
      placeholderTextColor={COLORS.hintText}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      autoCapitalize={email ? 'none' : 'words'}
      autoCorrect={false}
      keyboardType={email ? 'email-address' : 'default'}
      secureTextEntry={secure}
      returnKeyType={returnKeyType}
    />
  </View>
);

const PasswordField: React.FC<Omit<InputProps, 'email' | 'secure'>> = ({ label, value, onChangeText, placeholder, disabled, returnKeyType }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <PasswordInput
      inputStyle={styles.input}
      accessibilityLabel={label}
      placeholder={placeholder}
      placeholderTextColor={COLORS.hintText}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType={returnKeyType}
    />
  </View>
);

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
  formSection: {
    width: '100%',
    maxWidth: 440,
    gap: SPACING.md,
  },
  formHeading: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.mediumText,
    textAlign: 'center',
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
  primaryButton: {
    minHeight: 56,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  linkButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },
});
