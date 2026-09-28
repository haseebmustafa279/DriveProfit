/**
 * Firebase Firestore service
 * Handles all database operations for daily records, monthly records, and car settings
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { DailyRecord, MonthlyRecord, CarPaymentData } from '../types/records';
import { FIRESTORE_COLLECTIONS, ERROR_MESSAGES } from '../constants/config';
import {
  getStartOfDayTimestamp,
  getEndOfDayTimestamp,
} from '../utils/dateUtils';

class FirestoreService {
  private getAuthenticatedUserId(): string {
    const userId = getAuth().currentUser?.uid;

    if (!userId) {
      throw new Error(ERROR_MESSAGES.general.unauthorized);
    }

    return userId;
  }

  private async assertDailyRecordOwnership(recordId: string, userId: string): Promise<void> {
    const recordSnapshot = await getDoc(
      doc(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords, recordId)
    );

    if (!recordSnapshot.exists || recordSnapshot.data()?.userId !== userId) {
      throw new Error(ERROR_MESSAGES.general.unauthorized);
    }
  }

  /**
   * Add daily record (income or expense)
   */
  public async addDailyRecord(record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = this.getAuthenticatedUserId();
      const now = Date.now();
      const docRef = await addDoc(
        collection(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords),
        {
          ...record,
          userId,
          createdAt: now,
          updatedAt: now,
        }
      );

      return docRef.id;
    } catch {
      throw new Error(ERROR_MESSAGES.entry.saveFailed);
    }
  }

  /**
   * Update daily record
   */
  public async updateDailyRecord(
    recordId: string,
    updates: Partial<DailyRecord>
  ): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId();
      await this.assertDailyRecordOwnership(recordId, userId);

      const editableUpdates = { ...updates };
      delete editableUpdates.id;
      delete editableUpdates.userId;
      delete editableUpdates.createdAt;
      delete editableUpdates.updatedAt;

      await updateDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords, recordId),
        {
          ...editableUpdates,
          updatedAt: Date.now(),
        }
      );
    } catch {
      throw new Error(ERROR_MESSAGES.entry.saveFailed);
    }
  }

  /**
   * Delete daily record
   */
  public async deleteDailyRecord(recordId: string): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId();
      await this.assertDailyRecordOwnership(recordId, userId);

      await deleteDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords, recordId)
      );
    } catch {
      throw new Error(ERROR_MESSAGES.entry.deleteFailed);
    }
  }

  /**
   * Get daily records for a specific date and user
   */
  public async getDailyRecords(dateTimestamp: number): Promise<DailyRecord[]> {
    try {
      const userId = this.getAuthenticatedUserId();
      const dayStart = getStartOfDayTimestamp(dateTimestamp);
      const dayEnd = getEndOfDayTimestamp(dateTimestamp);

      const snapshot = await getDocs(
        query(
          collection(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords),
          where('userId', '==', userId),
          where('date', '>=', dayStart),
          where('date', '<=', dayEnd)
        )
      );

      return snapshot.docs.map(recordDoc => ({
        ...recordDoc.data(),
        id: recordDoc.id,
      })) as DailyRecord[];
    } catch {
      throw new Error(ERROR_MESSAGES.entry.loadFailed);
    }
  }

  /**
   * Listen to daily records for real-time updates
   */
  public onDailyRecordsChanged(
    dateTimestamp: number,
    callback: (records: DailyRecord[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    let userId: string;
    try {
      userId = this.getAuthenticatedUserId();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(ERROR_MESSAGES.entry.loadFailed));
      return () => { };
    }

    const dayStart = getStartOfDayTimestamp(dateTimestamp);
    const dayEnd = getEndOfDayTimestamp(dateTimestamp);

    const unsubscribe = onSnapshot(
      query(
        collection(getFirestore(), FIRESTORE_COLLECTIONS.dailyRecords),
        where('userId', '==', userId),
        where('date', '>=', dayStart),
        where('date', '<=', dayEnd)
      ),
      snapshot => {
        const records = snapshot.docs.map(recordDoc => ({
          ...recordDoc.data(),
          id: recordDoc.id,
        })) as DailyRecord[];

        callback(records);
      },
      error => {
        console.error('Error listening to daily records:', error);
        onError?.(new Error(ERROR_MESSAGES.entry.loadFailed));
      }
    );

    return unsubscribe;
  }

  /**
   * Add monthly record (profit or car expense)
   */
  public async addMonthlyRecord(
    record: Omit<MonthlyRecord, 'id' | 'createdAt' | 'updatedAt'>,
    workspaceId: string
  ): Promise<string> {
    try {
      const userId = this.getAuthenticatedUserId();
      const now = Date.now();
      const docRef = await addDoc(
        collection(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords),
        {
          ...record,
          workspaceId,
          createdBy: userId,
          updatedBy: userId,
          createdAt: now,
          updatedAt: now,
        }
      );

      return docRef.id;
    } catch {
      throw new Error(ERROR_MESSAGES.entry.saveFailed);
    }
  }

  /**
   * Update monthly record
   */
  public async updateMonthlyRecord(
    recordId: string,
    updates: Partial<MonthlyRecord>
  ): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId();
      const editableUpdates = { ...updates };
      delete editableUpdates.id;
      delete editableUpdates.createdBy;
      delete editableUpdates.createdAt;
      delete editableUpdates.updatedAt;
      delete editableUpdates.workspaceId;

      await updateDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords, recordId),
        {
          ...editableUpdates,
          updatedBy: userId,
          updatedAt: Date.now(),
        }
      );
    } catch {
      throw new Error(ERROR_MESSAGES.entry.saveFailed);
    }
  }

  /**
   * Delete monthly record
   */
  public async deleteMonthlyRecord(recordId: string): Promise<void> {
    try {
      this.getAuthenticatedUserId();
      await deleteDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords, recordId)
      );
    } catch {
      throw new Error(ERROR_MESSAGES.entry.deleteFailed);
    }
  }

  /**
   * Get monthly records for a specific month
   */
  public async getMonthlyRecords(monthKey: string, workspaceId: string): Promise<MonthlyRecord[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords),
          where('workspaceId', '==', workspaceId),
          where('monthKey', '==', monthKey)
        )
      );

      return snapshot.docs.map(recordDoc => ({
        ...recordDoc.data(),
        id: recordDoc.id,
      })) as MonthlyRecord[];
    } catch {
      throw new Error(ERROR_MESSAGES.entry.loadFailed);
    }
  }

  /**
   * Listen to monthly records for real-time updates
   */
  public onMonthlyRecordsChanged(
    monthKey: string,
    workspaceId: string,
    callback: (records: MonthlyRecord[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    if (!workspaceId) {
      const error = new Error(ERROR_MESSAGES.general.unauthorized);
      console.error('Cannot listen to monthly records without a resolved workspace:', {
        monthKey,
        workspaceId,
      });
      onError?.(error);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      query(
        collection(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords),
        where('workspaceId', '==', workspaceId),
        where('monthKey', '==', monthKey)
      ),
      snapshot => {
        const records = snapshot.docs.map(recordDoc => ({
          ...recordDoc.data(),
          id: recordDoc.id,
        })) as MonthlyRecord[];

        callback(records);
      },
      error => {
        console.error('Error listening to monthly records:', {
          message: error.message,
          monthKey,
          workspaceId,
        });
        onError?.(new Error(ERROR_MESSAGES.entry.loadFailed));
      }
    );

    return unsubscribe;
  }

  /**
   * Get all monthly records for car payment calculation
   * Used to calculate remaining car amount
   */
  public async getAllMonthlyRecords(workspaceId: string): Promise<MonthlyRecord[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords),
          where('workspaceId', '==', workspaceId)
        )
      );

      return snapshot.docs.map(recordDoc => ({
        ...recordDoc.data(),
        id: recordDoc.id,
      })) as MonthlyRecord[];
    } catch {
      throw new Error(ERROR_MESSAGES.entry.loadFailed);
    }
  }

  /**
   * Listen to all monthly records for real-time car tracker updates
   */
  public onAllMonthlyRecordsChanged(
    workspaceId: string,
    callback: (records: MonthlyRecord[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      query(
        collection(getFirestore(), FIRESTORE_COLLECTIONS.monthlyRecords),
        where('workspaceId', '==', workspaceId)
      ),
      snapshot => {
        const records = snapshot.docs.map(recordDoc => ({
          ...recordDoc.data(),
          id: recordDoc.id,
        })) as MonthlyRecord[];

        callback(records);
      },
      error => {
        console.error('Error listening to all monthly records:', error);
        onError?.(new Error(ERROR_MESSAGES.entry.loadFailed));
      }
    );

    return unsubscribe;
  }

  /**
   * Get car settings
   */
  public async getCarSettings(workspaceId: string): Promise<CarPaymentData> {
    try {
      const carSettingsDoc = await getDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.carTrackers, workspaceId)
      );

      if (!carSettingsDoc.exists()) {
        const defaults = {
          purchasePrice: 3500000, // Rs. 3,500,000 in integer rupees
          lastUpdated: Date.now(),
          workspaceId,
        };
        await setDoc(
          doc(getFirestore(), FIRESTORE_COLLECTIONS.carTrackers, workspaceId),
          defaults
        );
        return defaults;
      }

      return carSettingsDoc.data() as CarPaymentData;
    } catch {
      throw new Error(ERROR_MESSAGES.general.genericError);
    }
  }

  /**
   * Update car settings
   */
  public async updateCarSettings(workspaceId: string, settings: Partial<CarPaymentData>): Promise<void> {
    try {
      await setDoc(
        doc(getFirestore(), FIRESTORE_COLLECTIONS.carTrackers, workspaceId),
        {
          ...settings,
          workspaceId,
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    } catch {
      throw new Error(ERROR_MESSAGES.general.genericError);
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
