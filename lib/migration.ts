import { NetWorthRecord } from '@/types';

// 从Local Storage获取数据
export function getLocalStorageData(): NetWorthRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const data = localStorage.getItem('netWorthRecords');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  return [];
}

// 检查是否有Local Storage数据需要迁移
export function hasLocalStorageData(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const data = localStorage.getItem('netWorthRecords');
    return data !== null && data !== '[]';
  } catch (error) {
    console.error('Error checking localStorage:', error);
    return false;
  }
}

// 清除Local Storage数据（迁移后）
export function clearLocalStorageData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('netWorthRecords');
    console.log('Local storage data cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// 迁移数据到数据库
export async function migrateDataToDatabase(): Promise<{
  success: boolean;
  message: string;
  migratedCount?: number;
}> {
  try {
    const records = getLocalStorageData();
    
    if (records.length === 0) {
      return {
        success: true,
        message: 'No data to migrate'
      };
    }

    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Migration failed');
    }

    const result = await response.json();
    
    // 迁移成功后清除Local Storage数据
    if (result.migratedCount > 0) {
      clearLocalStorageData();
    }

    return {
      success: true,
      message: result.message,
      migratedCount: result.migratedCount
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Migration failed'
    };
  }
} 