import React, { useState } from 'react';
import { Search } from 'lucide-react';
import  ExpertCard  from '../components/ExpertCard';
import { experts } from '../data/mockData';
import { Input } from '../components/ui/input';

export function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('experts');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Discover</h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search experts, topics, or groups..."
            className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('experts')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'experts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Experts
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'communities'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Communities
          </button>
        </div>

        <div className="space-y-4">
          {experts.map((expert) => (
            <ExpertCard key={expert.id} {...expert} />
          ))}
        
          {experts.map((expert) => (
            <ExpertCard key={`dup-${expert.id}`} {...expert} />
          ))}
        </div>
      </div>
    </div>
  );
}
