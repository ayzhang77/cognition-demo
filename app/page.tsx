import Link from 'next/link';
import { Card } from '@/components/shared/Card';

export default function Dashboard() {
  const stats = [
    { title: 'KYC Cases', value: '5', href: '/kyc', color: 'bg-blue-500' },
    { title: 'Refund Requests', value: '6', href: '/refunds', color: 'bg-green-500' },
    { title: 'Feature Flags', value: '5', href: '/feature-flags', color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operations Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/kyc">
            <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <p className="font-medium">Review KYC Cases</p>
              <p className="text-sm text-blue-600">Process pending verifications</p>
            </button>
          </Link>
          <Link href="/refunds">
            <button className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left">
              <p className="font-medium">Process Refunds</p>
              <p className="text-sm text-green-600">Handle refund requests</p>
            </button>
          </Link>
          <Link href="/feature-flags">
            <button className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <p className="font-medium">Manage Feature Flags</p>
              <p className="text-sm text-purple-600">Configure feature rollouts</p>
            </button>
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Environment</span>
            <span className="font-medium">Development</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-green-600">Operational</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
