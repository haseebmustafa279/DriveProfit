import React from 'react';
import {
  ActivityIndicator,
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
    <View style={styles.container}>
      <Text style={styles.title}>Secure Access</Text>
      <Text style={styles.description}>Enter your PIN to open the car payment tracker.</Text>
      <TextInput
        accessibilityLabel="Module 3 PIN"
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
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity disabled={isVerifying} onPress={handleVerify} style={styles.button}>
        {isVerifying ? <ActivityIndicator color={COLORS.lightBg} /> : <Text style={styles.buttonText}>Verify PIN</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightBg,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    color: COLORS.mediumText,
    fontSize: TYPOGRAPHY.fontSize.body,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    color: COLORS.darkText,
    fontSize: TYPOGRAPHY.fontSize.h3,
    letterSpacing: 8,
    padding: SPACING.md,
    textAlign: 'center',
    width: 180,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.lg,
    minWidth: 140,
    padding: SPACING.md,
  },
  buttonText: {
    color: COLORS.lightBg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});