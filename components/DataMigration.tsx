'use client';

import { useState, useEffect } from 'react';
import { hasLocalStorageData, migrateDataToDatabase } from '@/lib/migration';
import { AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';

export default function DataMigration() {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    migratedCount?: number;
  } | null>(null);

  useEffect(() => {
    setHasLocalData(hasLocalStorageData());
  }, []);

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateDataToDatabase();
      setMigrationResult(result);
      
      if (result.success) {
        setHasLocalData(false);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Migration failed unexpectedly'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!hasLocalData) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            发现本地数据
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            检测到您的浏览器中保存了净资产记录数据。建议将数据迁移到云端数据库以确保数据安全和跨设备同步。
          </p>
          
          {migrationResult && (
            <div className={`mb-3 p-3 rounded-md ${
              migrationResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {migrationResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${
                  migrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {migrationResult.message}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleMigration}
            disabled={isMigrating}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isMigrating
                ? 'bg-blue-300 text-blue-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>迁移中...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>迁移到云端</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 