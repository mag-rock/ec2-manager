'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InstanceList from './components/InstanceList';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState([]);
  const [error, setError] = useState('');

  // インスタンス一覧を取得する関数
  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instances');
      if (!response.ok) {
        throw new Error('インスタンス一覧の取得に失敗しました');
      }
      const data = await response.json();
      setInstances(data.instances);
      setError('');
    } catch (err) {
      console.error('インスタンス取得エラー:', err);
      setError('インスタンスの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時にインスタンス一覧を取得
  useEffect(() => {
    fetchInstances();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EC2インスタンス管理</h1>
        <button
          onClick={fetchInstances}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          更新
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <InstanceList instances={instances} onRefresh={fetchInstances} />
      )}
    </div>
  );
}
