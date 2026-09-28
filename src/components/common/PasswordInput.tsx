import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

type PasswordInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  containerStyle,
  inputStyle,
  secureTextEntry = true,
  ...inputProps
}) => {
  const [isVisible, setIsVisible] = React.useState(!secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...inputProps}
        style={[styles.input, inputStyle]}
        secureTextEntry={!isVisible}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        onPress={() => setIsVisible(previous => !previous)}
        style={styles.toggle}
      >
        <Text style={styles.eye}>{isVisible ? '👁' : '👁'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.dividerColor,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.xxl,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.darkText,
    backgroundColor: COLORS.cardBg,
  },
  toggle: {
    position: 'absolute',
    right: SPACING.sm,
    top: 0,
    bottom: 0,
    width: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    fontSize: TYPOGRAPHY.fontSize.body,
  },
});
