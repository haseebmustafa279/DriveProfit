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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.appSubtitle}>Start using DriveProfit</Text>
        </View>

        <View style={styles.formSection}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Enter your name" disabled={isLoading} />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" disabled={isLoading} email />
          <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" disabled={isLoading} />
          <PasswordField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your password" disabled={isLoading} />

          {(validationError || state.error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError || state.error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
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
};

const Input: React.FC<InputProps> = ({ label, value, onChangeText, placeholder, disabled, email, secure }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.hintText}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      autoCapitalize={email ? 'none' : 'words'}
      autoCorrect={false}
      keyboardType={email ? 'email-address' : 'default'}
      secureTextEntry={secure}
    />
  </View>
);

const PasswordField: React.FC<Omit<InputProps, 'email' | 'secure'>> = ({ label, value, onChangeText, placeholder, disabled }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <PasswordInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.hintText}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  headerSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  appTitle: { fontSize: TYPOGRAPHY.fontSize.h1, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.primary, marginBottom: SPACING.sm },
  appSubtitle: { fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.mediumText },
  formSection: { gap: SPACING.lg },
  inputContainer: { gap: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.darkText },
  input: { borderWidth: 1, borderColor: COLORS.dividerColor, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.darkText, backgroundColor: COLORS.cardBg },
  errorContainer: { backgroundColor: `${COLORS.error}15`, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  errorText: { color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.caption, fontWeight: TYPOGRAPHY.fontWeight.medium },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.lg },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: COLORS.lightBg, fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.bold },
  linkText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.medium, textAlign: 'center' },
});
