import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../firebase/auth';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { validatePasswordResetEmail } from '../../utils/validation';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setValidationError(null);
    setError(null);
    const validation = validatePasswordResetEmail(email);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      Alert.alert('Check your email', 'A password reset link has been sent.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Text style={styles.formTitle} accessibilityRole="header">Forgot Password?</Text>
            <Text style={styles.formSubtitle}>
              Enter the email address associated with your account and we’ll send you a reset link.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, (validationError || error) && styles.inputError]}
              accessibilityLabel="Email"
              accessibilityHint="Enter the email address associated with your account."
              placeholder="Enter your email"
              placeholderTextColor={COLORS.hintText}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="done"
            />
          </View>

          {(validationError || error) && (
            <View style={styles.errorContainer} accessibilityRole="alert">
              <Text style={styles.errorText}>{validationError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send password reset email"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
            activeOpacity={0.82}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.primaryButtonText}>Send Reset Email</Text>}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg },
  headerSection: { width: '100%', maxWidth: 440, alignItems: 'center', marginBottom: SPACING.xl },
  appTitle: { fontSize: TYPOGRAPHY.fontSize.h1, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.primary, marginBottom: SPACING.sm },
  appSubtitle: { fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.mediumText, textAlign: 'center' },
  formSection: { width: '100%', maxWidth: 440, gap: SPACING.md },
  formHeading: { alignItems: 'center', marginBottom: SPACING.xs },
  formTitle: { fontSize: TYPOGRAPHY.fontSize.h3, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.darkText, textAlign: 'center', marginBottom: SPACING.xs },
  formSubtitle: { fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.mediumText, textAlign: 'center' },
  inputContainer: { gap: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.darkText },
  input: { minHeight: 56, borderWidth: 1, borderColor: COLORS.dividerColor, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.darkText, backgroundColor: COLORS.cardBg },
  inputError: { borderColor: COLORS.error },
  errorContainer: { backgroundColor: `${COLORS.error}15`, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  errorText: { color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.caption, fontWeight: TYPOGRAPHY.fontWeight.medium },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, minHeight: 56, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: COLORS.lightBg, fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.bold },
  linkButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm },
  linkText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.medium, textAlign: 'center' },
});
