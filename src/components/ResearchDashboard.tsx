import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Globe2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GlobalHub {
  id: string | number;
  name: string | null;
  country: string | null;
  website: string | null;
}

/**
 * A reusable live-data-only hub directory. It intentionally does not contain
 * seeded research metrics, fabricated adoption rates, or local hub records.
 */
export const ResearchDashboard: React.FC = () => {
  const [hubs, setHubs] = useState<GlobalHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadHubs = async () => {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('global_hubs')
      .select('id,name,country,website')
      .order('name', { ascending: true });

    if (queryError) {
      setHubs([]);
      setError(queryError.message);
    } else {
      setHubs((data ?? []) as GlobalHub[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHubs();
  }, []);

  const filteredHubs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return hubs;

    return hubs.filter((hub) => [hub.name, hub.country, hub.website]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch)));
  }, [hubs, search]);

  return (
    <section className="space-y-6" aria-labelledby="live-research-heading">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Live research network</p>
          <h2 id="live-research-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">Global hub directory</h2>
          <p className="mt-2 max-w-2xl text-slate-400">This view renders only the global-hub records returned by the configured TELsTP Supabase project.</p>
        </div>
        <button
          type="button"
          onClick={loadHubs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh live directory
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          <div>
            <p className="font-medium">The live hub directory is unavailable.</p>
            <p className="mt-1 text-sm text-amber-100/80">{error}</p>
          </div>
        </div>
      )}

      <label className="block">
        <span className="sr-only">Search global hubs</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search live hub records"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
        />
      </label>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 px-5 py-4 text-sm text-slate-400">
          {loading ? 'Loading live records…' : `${filteredHubs.length} live record${filteredHubs.length === 1 ? '' : 's'} shown`}
        </div>
        <div className="divide-y divide-slate-800">
          {!loading && filteredHubs.map((hub) => (
            <article key={hub.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-white">{hub.name || 'Unnamed live record'}</h3>
                <p className="mt-1 text-sm text-slate-400">{hub.country || 'Country not supplied'}</p>
              </div>
              {hub.website && (
                <a className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200" href={hub.website} target="_blank" rel="noreferrer">
                  Visit source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </article>
          ))}
          {!loading && !error && filteredHubs.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-400">No live records match this search.</p>
          )}
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-500"><Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> Source: Supabase `global_hubs`</p>
    </section>
  );
};

export default ResearchDashboard;
