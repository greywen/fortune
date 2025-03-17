'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/ziwei" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">紫微斗数</h2>
          <p className="text-gray-600">紫微斗数是中国传统命理学的一种，通过出生年、月、日、时来推算命盘。</p>
        </Link>
        <Link href="/liuyao" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">六爻算命</h2>
          <p className="text-gray-600">六爻是中国传统的占卜方法，通过铜钱或其他方式起卦，解读吉凶。</p>
        </Link>
      </div>
    </div>
  );
}
