import React from 'react';
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
import { APP_CONSTANTS } from '../../constants/config';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { verifyModule3Pin } from '../../services/module3Access';

export const Module3PinScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleVerify = async () => {
    if (pin.length < APP_CONSTANTS.PIN_LENGTH) {
      setError(`Enter your ${APP_CONSTANTS.PIN_LENGTH}-digit PIN`);
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const isVerified = await verifyModule3Pin(pin);
      setPin('');
      if (!isVerified) {
        setError('Incorrect PIN');
        return;
      }
      navigation.replace('CarTracker');
    } catch {
      setError('PIN verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.description}>Enter your PIN to open the car payment tracker.</Text>
          <TextInput
            accessibilityLabel="Module 3 PIN"
            accessibilityHint={`Enter your ${APP_CONSTANTS.PIN_LENGTH} to ${APP_CONSTANTS.MAX_PIN_LENGTH} digit PIN. Input is hidden.`}
            autoFocus
            keyboardType="number-pad"
            maxLength={APP_CONSTANTS.MAX_PIN_LENGTH}
            onChangeText={value => {
              setPin(value.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            secureTextEntry
            style={styles.input}
            value={pin}
          />
          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isVerifying ? 'Verifying PIN' : 'Verify PIN'}
            accessibilityState={{ disabled: isVerifying, busy: isVerifying }}
            disabled={isVerifying}
            onPress={handleVerify}
            style={styles.button}
          >
            {isVerifying ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.buttonText}>Verify PIN</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  content: {
    width: '100%',
    maxWidth: 420,
  },
  description: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    letterSpacing: 8,
    minHeight: 56,
    paddingHorizontal: SPACING.lg,
    textAlign: 'center',
    width: '100%',
    maxWidth: 240,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    marginTop: SPACING.xl,
    minHeight: 56,
    minWidth: 180,
    paddingHorizontal: SPACING.lg,
  },
  buttonText: {
    color: COLORS.lightBg,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});