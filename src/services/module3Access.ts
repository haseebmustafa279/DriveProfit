import Config from 'react-native-config';

export const verifyModule3Pin = async (pin: string): Promise<boolean> => {
  return pin === Config.MODULE3_PIN;
};