/**
 * Common types used across the app
 */

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ConfirmDialogConfig {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean; // for delete confirmations
}
