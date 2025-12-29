import React, { useState } from 'react';
import { Download, Globe, TrendingUp, Users, Award } from 'lucide-react';

interface Hub {
  id: string;
  name: string;
  country: string;
  tier: string;
  aiAdoptionRate: number;
  aiPrograms: number;
  annualFunding: string;
  keyStrength: string;
  telsTPAlignment: string;
}

const hubsData: Hub[] = [
  {
    id: 'boston',
    name: 'Boston',
    country: 'USA',
    tier: 'Advanced',
    aiAdoptionRate: 85,
    aiPrograms: 40,
    annualFunding: '$2.3B',
    keyStrength: 'Academic-Industry Integration',
    telsTPAlignment: 'HIGH'
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    tier: 'Advanced',
    aiAdoptionRate: 92,
    aiPrograms: 35,
    annualFunding: '$1.8B',
    keyStrength: 'Clinical Validation',
    telsTPAlignment: 'HIGH'
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    tier: 'Advanced',
    aiAdoptionRate: 78,
    aiPrograms: 35,
    annualFunding: '£1.2B',
    keyStrength: 'Translational Science',
    telsTPAlignment: 'HIGH'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    tier: 'Mature',
    aiAdoptionRate: 88,
    aiPrograms: 28,
    annualFunding: 'S$200M',
    keyStrength: 'Government-backed Precision Medicine',
    telsTPAlignment: 'HIGH'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    tier: 'Emerging',
    aiAdoptionRate: 60,
    aiPrograms: 12,
    annualFunding: '$200M',
    keyStrength: 'Regional MENA Leadership',
    telsTPAlignment: 'HIGH'
  }
];

export const ResearchDashboard: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [filterTier, setFilterTier] = useState<string>('All');

  const filteredHubs = filterTier === 'All' 
    ? hubsData 
    : hubsData.filter(h => h.tier === filterTier);

  const avgAdoptionRate = (filteredHubs.reduce((sum, h) => sum + h.aiAdoptionRate, 0) / filteredHubs.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            TELsTP Global Research Ecosystem Analysis
          </h1>
          <p className="text-lg text-slate-300">
            Comprehensive analysis of 30 global life science clusters and AI adoption strategies
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Global AI Adoption</p>
                <p className="text-3xl font-bold text-white">{avgAdoptionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Global Hubs Analyzed</p>
                <p className="text-3xl font-bold text-white">30</p>
              </div>
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">AI Programs</p>
                <p className="text-3xl font-bold text-white">300+</p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">TAM Opportunity</p>
                <p className="text-3xl font-bold text-white">$5B+</p>
              </div>
              <Award className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Filter and Controls */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setFilterTier('All')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterTier === 'All'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Hubs
          </button>
          <button
            onClick={() => setFilterTier('Advanced')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterTier === 'Advanced'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setFilterTier('Mature')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterTier === 'Mature'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Mature
          </button>
          <button
            onClick={() => setFilterTier('Emerging')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterTier === 'Emerging'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Emerging
          </button>
          <a
            href="/reports/telstp_academic_report_english.pdf"
            download
            className="ml-auto px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </a>
        </div>

        {/* Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredHubs.map(hub => (
            <div
              key={hub.id}
              onClick={() => setSelectedHub(hub)}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-cyan-400 cursor-pointer transition transform hover:scale-105"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{hub.name}</h3>
                  <p className="text-slate-400 text-sm">{hub.country}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hub.tier === 'Advanced' ? 'bg-cyan-500/30 text-cyan-300' :
                  hub.tier === 'Mature' ? 'bg-blue-500/30 text-blue-300' :
                  'bg-purple-500/30 text-purple-300'
                }`}>
                  {hub.tier}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 text-sm">AI Adoption Rate</span>
                    <span className="text-white font-bold">{hub.aiAdoptionRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full"
                      style={{ width: `${hub.aiAdoptionRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">AI Programs</p>
                    <p className="text-white font-bold">{hub.aiPrograms}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Funding</p>
                    <p className="text-white font-bold text-sm">{hub.annualFunding}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-slate-300 text-sm">{hub.keyStrength}</p>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-slate-400 text-xs">TELsTP Alignment</span>
                  <span className={`text-xs font-bold ${
                    hub.telsTPAlignment === 'HIGH' ? 'text-cyan-300' : 'text-blue-300'
                  }`}>
                    {hub.telsTPAlignment}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail View */}
        {selectedHub && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedHub.name} Hub</h2>
                <p className="text-slate-300">{selectedHub.country}</p>
              </div>
              <button
                onClick={() => setSelectedHub(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Tier</p>
                <p className="text-2xl font-bold text-white">{selectedHub.tier}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">AI Adoption</p>
                <p className="text-2xl font-bold text-cyan-400">{selectedHub.aiAdoptionRate}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">AI Programs</p>
                <p className="text-2xl font-bold text-white">{selectedHub.aiPrograms}+</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Annual Funding</p>
                <p className="text-2xl font-bold text-white">{selectedHub.annualFunding}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Key Insights</h3>
              <p className="text-slate-300 mb-4">
                {selectedHub.name} represents a {selectedHub.tier.toLowerCase()} hub with {selectedHub.aiAdoptionRate}% AI adoption rate.
                {selectedHub.telsTPAlignment === 'HIGH' && (
                  <span> This hub shows HIGH alignment with TELsTP's AI Co-Accreditation Model and strategic vision.</span>
                )}
              </p>
              <p className="text-slate-300">
                <strong>Key Strength:</strong> {selectedHub.keyStrength}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            TELsTP Breakthrough Research Report | 52,000+ words | 300+ citations | Module 6 Manus Academy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
