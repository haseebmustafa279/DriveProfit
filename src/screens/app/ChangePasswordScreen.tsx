import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../../firebase/auth';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { validatePasswordChange } from '../../utils/validation';
import { PasswordInput } from '../../components/common/PasswordInput';

export const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setValidationError(null);
    setError(null);
    const validation = validatePasswordChange(oldPassword, newPassword, confirmPassword);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      Alert.alert('Password Updated', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : 'Unable to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.appTitle}>Change Password</Text>
          <Text style={styles.appSubtitle}>Keep your DriveProfit account secure</Text>
        </View>

        <View style={styles.formSection}>
          <PasswordField label="Current Password" value={oldPassword} onChangeText={setOldPassword} placeholder="Enter your current password" disabled={isLoading} />
          <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Enter your new password" disabled={isLoading} />
          <PasswordField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your new password" disabled={isLoading} />

          {(validationError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  disabled: boolean;
};

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChangeText, placeholder, disabled }) => (
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
  appSubtitle: { fontSize: TYPOGRAPHY.fontSize.body, color: COLORS.mediumText, textAlign: 'center' },
  formSection: { gap: SPACING.lg },
  inputContainer: { gap: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.darkText },
  errorContainer: { backgroundColor: `${COLORS.error}15`, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  errorText: { color: COLORS.error, fontSize: TYPOGRAPHY.fontSize.caption, fontWeight: TYPOGRAPHY.fontWeight.medium },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.lg },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: COLORS.lightBg, fontSize: TYPOGRAPHY.fontSize.body, fontWeight: TYPOGRAPHY.fontWeight.bold },
});
