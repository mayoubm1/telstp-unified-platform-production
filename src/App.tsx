import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Database,
  Globe2,
  LayoutDashboard,
  MessageCircle,
  Network,
  RefreshCw,
  ShieldCheck,
  Users
} from 'lucide-react';
import './App.css';

const PLATFORM_CONFIG = {
  ceoName: 'Dr. Mohamed Hassan Amin',
  platformName: 'TELsTP OmniCognitor',
  platformSubtitle: 'Unified AI Platform · Live Operations View',
  organization: 'TAWASOL Egypt Life Science Technology Park'
};

type TabId = 'overview' | 'hubs' | 'integrity';

interface GlobalHub {
  id: string | number;
  name: string | null;
  country: string | null;
  website: string | null;
  contact_email: string | null;
}

interface LiveStats {
  globalHubs: number | null;
  messages: number | null;
  conversations: number | null;
  workspaces: number | null;
}

interface DataIssue {
  area: string;
  message: string;
}

const NAVIGATION: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Live Overview', icon: LayoutDashboard },
  { id: 'hubs', label: 'Global Hubs', icon: Globe2 },
  { id: 'integrity', label: 'Data Integrity', icon: ShieldCheck }
];

const countText = (value: number | null) => (value === null ? 'Unavailable' : value.toLocaleString());

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<LiveStats>({
    globalHubs: null,
    messages: null,
    conversations: null,
    workspaces: null
  });
  const [hubs, setHubs] = useState<GlobalHub[]>([]);
  const [dataIssues, setDataIssues] = useState<DataIssue[]>([]);
  const [query, setQuery] = useState('');

  const fetchLiveData = async () => {
    setRefreshing(true);
    setDataIssues([]);

    const [hubsResult, messagesResult, conversationsResult, workspacesResult] = await Promise.all([
      supabase
        .from('global_hubs')
        .select('id,name,country,website,contact_email')
        .order('name', { ascending: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('workspaces').select('id', { count: 'exact', head: true })
    ]);

    const issues: DataIssue[] = [];

    if (hubsResult.error) {
      issues.push({ area: 'Global hubs', message: hubsResult.error.message });
      setHubs([]);
    } else {
      setHubs((hubsResult.data ?? []) as GlobalHub[]);
    }

    if (messagesResult.error) {
      issues.push({ area: 'Messages', message: messagesResult.error.message });
    }

    if (conversationsResult.error) {
      issues.push({ area: 'Conversations', message: conversationsResult.error.message });
    }

    if (workspacesResult.error) {
      issues.push({ area: 'Workspaces', message: workspacesResult.error.message });
    }

    setStats({
      globalHubs: hubsResult.error ? null : hubsResult.data?.length ?? 0,
      messages: messagesResult.error ? null : messagesResult.count ?? 0,
      conversations: conversationsResult.error ? null : conversationsResult.count ?? 0,
      workspaces: workspacesResult.error ? null : workspacesResult.count ?? 0
    });
    setDataIssues(issues);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const filteredHubs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return hubs;

    return hubs.filter((hub) => {
      return [hub.name, hub.country, hub.website]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [hubs, query]);

  const liveConnectionHealthy = dataIssues.length === 0;

  const MetricCard = ({
    label,
    value,
    icon: Icon,
    accent,
    description
  }: {
    label: string;
    value: number | null;
    icon: React.ElementType;
    accent: string;
    description: string;
  }) => (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{countText(value)}</p>
          <p className="mt-2 text-sm leading-5 text-slate-400">{description}</p>
        </div>
        <div className={`rounded-xl border p-3 ${accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );

  const IntegrityNotice = () => {
    if (liveConnectionHealthy) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
          <div>
            <p className="font-medium">All queried data sources responded successfully.</p>
            <p className="mt-1 text-sm text-emerald-200/80">Every value in this view is read directly from the configured Supabase project.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <div>
            <p className="font-medium">Some live data sources require remediation.</p>
            <p className="mt-1 text-sm text-amber-100/80">Unavailable values are intentionally shown as unavailable. No substitute or simulated values are displayed.</p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-amber-400/10 rounded-lg border border-amber-400/10 bg-slate-950/30">
          {dataIssues.map((issue) => (
            <div key={issue.area} className="px-3 py-2.5 text-sm">
              <span className="font-semibold text-amber-200">{issue.area}:</span>{' '}
              <span className="text-amber-100/80">{issue.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-300" />
          <p className="mt-5 text-lg font-medium">Connecting to TELsTP live data</p>
          <p className="mt-2 text-sm text-slate-400">No dashboard values are shown until the configured data sources respond.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-52 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
              <Network className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{PLATFORM_CONFIG.organization}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{PLATFORM_CONFIG.platformName}</h1>
              <p className="mt-1 text-sm text-slate-400">{PLATFORM_CONFIG.platformSubtitle} · Led by {PLATFORM_CONFIG.ceoName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${liveConnectionHealthy ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/20 bg-amber-400/10 text-amber-200'}`}>
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span>{liveConnectionHealthy ? 'Live data connected' : 'Live data attention required'}</span>
            </div>
            <button
              type="button"
              onClick={fetchLiveData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {refreshing ? 'Refreshing' : 'Refresh live data'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <nav className="mb-7 flex w-full gap-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5" aria-label="Platform navigation">
          {NAVIGATION.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === 'overview' && (
          <section className="space-y-7" aria-labelledby="overview-heading">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Operational snapshot</p>
                <h2 id="overview-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">Verified live records</h2>
                <p className="mt-2 max-w-2xl text-slate-400">This dashboard reports only values returned by the configured TELsTP Supabase project. A zero is a real zero; an unavailable value remains unavailable.</p>
              </div>
              <p className="text-sm text-slate-500">Last client refresh: {lastUpdated ? lastUpdated.toLocaleString() : 'Not yet refreshed'}</p>
            </div>

            <IntegrityNotice />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Global hubs" value={stats.globalHubs} icon={Globe2} accent="border-cyan-400/20 bg-cyan-400/10 text-cyan-300" description="Live records in the global hub directory." />
              <MetricCard label="Messages" value={stats.messages} icon={MessageCircle} accent="border-violet-400/20 bg-violet-400/10 text-violet-300" description="Live records in the messages table." />
              <MetricCard label="Conversations" value={stats.conversations} icon={Users} accent="border-blue-400/20 bg-blue-400/10 text-blue-300" description="Live records in the conversations table." />
              <MetricCard label="Workspaces" value={stats.workspaces} icon={Building2} accent="border-amber-400/20 bg-amber-400/10 text-amber-300" description="Live count where policy access permits it." />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Global network directory</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Live hub coverage</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Browse the real global-hub records currently available to the application. This directory contains no locally defined hub list.</p>
                  </div>
                  <button type="button" onClick={() => setActiveTab('hubs')} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
                    Open directory <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {hubs.slice(0, 6).map((hub) => (
                    <div key={hub.id} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <p className="font-medium text-slate-100">{hub.name || 'Unnamed live record'}</p>
                      <p className="mt-1 text-sm text-slate-500">{hub.country || 'Country not supplied'}</p>
                    </div>
                  ))}
                  {hubs.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No global-hub records were returned by the live query.</p>}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <Database className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Traceability</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Data before presentation</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">The interface is intentionally restrained: it avoids simulated activity, prefilled entities, and invented metrics. Any inaccessible source is reported as an actionable integrity state.</p>
              </article>
            </div>
          </section>
        )}

        {activeTab === 'hubs' && (
          <section className="space-y-6" aria-labelledby="hubs-heading">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Live directory</p>
                <h2 id="hubs-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">Global life-science hubs</h2>
                <p className="mt-2 text-slate-400">Records are loaded directly from the `global_hubs` table of the configured TELsTP project.</p>
              </div>
              <label className="block">
                <span className="sr-only">Search live global hubs</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by hub, country, or website"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 md:w-80"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 text-sm text-slate-400">
                <span>{filteredHubs.length} live record{filteredHubs.length === 1 ? '' : 's'} shown</span>
                <span>Source: Supabase `global_hubs`</span>
              </div>
              <div className="divide-y divide-slate-800">
                {filteredHubs.map((hub) => (
                  <article key={hub.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-800/30 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{hub.name || 'Unnamed live record'}</h3>
                      <p className="mt-1 text-sm text-slate-400">{hub.country || 'Country not supplied'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {hub.contact_email && <a className="text-slate-400 transition hover:text-cyan-200" href={`mailto:${hub.contact_email}`}>{hub.contact_email}</a>}
                      {hub.website && (
                        <a className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 font-medium text-cyan-300 transition hover:border-cyan-400/40 hover:text-cyan-200" href={hub.website} target="_blank" rel="noreferrer">
                          Visit source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
                {filteredHubs.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-400">No live global-hub records match this search.</p>}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'integrity' && (
          <section className="space-y-6" aria-labelledby="integrity-heading">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Review controls</p>
              <h2 id="integrity-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">Live data integrity</h2>
              <p className="mt-2 max-w-3xl text-slate-400">Operational transparency is part of the TELsTP platform contract. This view distinguishes confirmed values from data sources requiring remediation.</p>
            </div>

            <IntegrityNotice />

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">Verified active path</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">The global hub directory responds to the application’s configured Supabase client and is rendered directly from returned records. Messages and conversations return their actual current count, including zero when no records exist.</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">Controlled remediation path</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">Workspace availability depends on its database access policy. If the query fails, this release reports the returned issue instead of substituting a count or prefilled workspace catalogue.</p>
              </article>
            </div>
          </section>
        )}
      </div>

      <footer className="relative border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>{PLATFORM_CONFIG.organization} · {PLATFORM_CONFIG.platformName}</p>
          <p>Verified live-state interface · No simulated operational records</p>
        </div>
      </footer>
    </div>
  );
}
