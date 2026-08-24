import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CalendarCheck2,
  CheckCircle2,
  CircleDot,
  Database,
  Globe2,
  HeartPulse,
  Layers3,
  Link2,
  MessageSquareText,
  Microscope,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  XCircle,
} from 'lucide-react';
import './App.css';
import {
  type AgentProjectLink,
  type AiAgent,
  type GlobalHub,
  type LiveStats,
  emptyLiveStats,
  isSupabaseConfigured,
  supabase,
  supabaseConfigurationMessage,
} from './lib/supabase';

const PLATFORM_NAME = 'TELsTP OmniCognitor';
const PLATFORM_SUBTITLE = 'Unified AI Platform';

const tabs = [
  { id: 'overview', label: 'Command Centre', icon: Layers3 },
  { id: 'hubs', label: 'Global Hubs', icon: Globe2 },
  { id: 'agents', label: 'AI Network', icon: Bot },
  { id: 'projects', label: 'Project Links', icon: Network },
  { id: 'm23m', label: 'M2-3M', icon: BrainCircuit },
  { id: 'telemedicine', label: 'Telemedicine', icon: HeartPulse },
] as const;

type TabId = (typeof tabs)[number]['id'];
type LiveStatus = 'loading' | 'connected' | 'partial' | 'error' | 'unconfigured';

interface DashboardData {
  stats: LiveStats;
  hubs: GlobalHub[];
  agents: AiAgent[];
  projectLinks: AgentProjectLink[];
  errors: string[];
  lastSynced: Date | null;
}

const initialData: DashboardData = {
  stats: emptyLiveStats,
  hubs: [],
  agents: [],
  projectLinks: [],
  errors: [],
  lastSynced: null,
};

function readConfiguration(configuration: Record<string, unknown> | null, key: string) {
  const value = configuration?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function shortId(value: string | null) {
  return value ? `${value.slice(0, 8)}…${value.slice(-4)}` : 'Unassigned';
}

function displayCount(value: number | null) {
  return value === null ? '—' : value.toLocaleString();
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null;
  detail: string;
  tone: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl ${tone}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white">{displayCount(value)}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
        </div>
        <div className={`rounded-xl border border-white/10 p-3 ${tone}`}>
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
      <CircleDot className="mx-auto h-7 w-7 text-slate-500" />
      <h3 className="mt-3 text-base font-semibold text-slate-200">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: LiveStatus }) {
  const appearance = {
    loading: { label: 'Synchronizing', icon: RefreshCw, className: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
    connected: { label: 'Database connected', icon: CheckCircle2, className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
    partial: { label: 'Partial data access', icon: AlertTriangle, className: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
    error: { label: 'Data unavailable', icon: XCircle, className: 'border-rose-400/30 bg-rose-400/10 text-rose-200' },
    unconfigured: { label: 'Configuration required', icon: AlertTriangle, className: 'border-rose-400/30 bg-rose-400/10 text-rose-200' },
  }[status];
  const Icon = appearance.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${appearance.className}`}>
      <Icon className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
      {appearance.label}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [data, setData] = useState<DashboardData>(initialData);
  const [status, setStatus] = useState<LiveStatus>(isSupabaseConfigured ? 'loading' : 'unconfigured');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLiveData = async () => {
    if (!supabase) {
      setStatus('unconfigured');
      setData((current) => ({ ...current, errors: [supabaseConfigurationMessage] }));
      return;
    }

    setIsRefreshing(true);
    setStatus('loading');

    const [
      hubsResult,
      agentsResult,
      projectLinksResult,
      hubsCountResult,
      agentsCountResult,
      projectLinksCountResult,
      aiMessagesCountResult,
      appointmentsCountResult,
      m23mAgentsCountResult,
      m23mProjectsCountResult,
      m23mTasksCountResult,
    ] = await Promise.all([
      supabase
        .from('global_hubs')
        .select('id,name,country,hub_name,location,contact_email,website,phone,address,key_contact_person,specialization_areas,partnership_priority,strategic_value,created_at')
        .order('id', { ascending: true }),
      supabase.from('ai_agents').select('id,name,configuration,created_at').order('created_at', { ascending: true }),
      supabase
        .from('agents_projects')
        .select('id,agent_id,project_id,role,permissions,created_at')
        .order('created_at', { ascending: true }),
      supabase.from('global_hubs').select('*', { count: 'exact', head: true }),
      supabase.from('ai_agents').select('*', { count: 'exact', head: true }),
      supabase.from('agents_projects').select('*', { count: 'exact', head: true }),
      supabase.from('ai_messages').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('global_ai_agents').select('*', { count: 'exact', head: true }),
      supabase.from('global_projects').select('*', { count: 'exact', head: true }),
      supabase.from('global_tasks').select('*', { count: 'exact', head: true }),
    ]);

    const responses = [
      ['global_hubs', hubsResult],
      ['ai_agents', agentsResult],
      ['agents_projects', projectLinksResult],
      ['global_hubs count', hubsCountResult],
      ['ai_agents count', agentsCountResult],
      ['agents_projects count', projectLinksCountResult],
      ['ai_messages count', aiMessagesCountResult],
      ['appointments count', appointmentsCountResult],
      ['global_ai_agents count', m23mAgentsCountResult],
      ['global_projects count', m23mProjectsCountResult],
      ['global_tasks count', m23mTasksCountResult],
    ] as const;
    const errors = responses
      .filter(([, response]) => response.error)
      .map(([source, response]) => `${source}: ${response.error?.message ?? 'unknown error'}`);

    const countOrNull = (response: { count: number | null; error: unknown }) =>
      response.error ? null : response.count ?? 0;

    setData({
      hubs: hubsResult.error ? [] : ((hubsResult.data ?? []) as GlobalHub[]),
      agents: agentsResult.error ? [] : ((agentsResult.data ?? []) as AiAgent[]),
      projectLinks: projectLinksResult.error ? [] : ((projectLinksResult.data ?? []) as AgentProjectLink[]),
      stats: {
        hubs: countOrNull(hubsCountResult),
        agents: countOrNull(agentsCountResult),
        projectLinks: countOrNull(projectLinksCountResult),
        aiMessages: countOrNull(aiMessagesCountResult),
        appointments: countOrNull(appointmentsCountResult),
        m23mAgents: countOrNull(m23mAgentsCountResult),
        m23mProjects: countOrNull(m23mProjectsCountResult),
        m23mTasks: countOrNull(m23mTasksCountResult),
      },
      errors,
      lastSynced: new Date(),
    });

    setStatus(errors.length === 0 ? 'connected' : errors.length === responses.length ? 'error' : 'partial');
    setIsRefreshing(false);
  };

  useEffect(() => {
    void loadLiveData();
    // The client is created once from build-time environment variables.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agentsById = useMemo(() => new Map(data.agents.map((agent) => [agent.id, agent])), [data.agents]);
  const highPriorityHubs = useMemo(
    () => data.hubs.filter((hub) => hub.partnership_priority?.toLowerCase() === 'high' || hub.partnership_priority?.toLowerCase() === 'primary'),
    [data.hubs],
  );
  const visibleHubs = data.hubs.slice(0, 12);

  const renderOverview = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-violet-600/10 p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-4 w-4" />
              TELsTP operational intelligence
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">One verified view of the global life-science network.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              This command centre reads the production Supabase project directly. Every metric and record below is sourced from the named database table; unavailable data is shown explicitly rather than replaced with an estimate.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Verified priority network</p>
            <p className="mt-2 text-3xl font-semibold text-white">{displayCount(highPriorityHubs.length)}</p>
            <p className="mt-1 text-xs text-slate-400">High or primary hub records</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Globe2} label="Global hubs" value={data.stats.hubs} detail="public.global_hubs" tone="bg-cyan-500" />
        <MetricCard icon={Bot} label="AI agents" value={data.stats.agents} detail="public.ai_agents" tone="bg-violet-500" />
        <MetricCard icon={Link2} label="Project links" value={data.stats.projectLinks} detail="public.agents_projects" tone="bg-blue-500" />
        <MetricCard icon={MessageSquareText} label="AI messages" value={data.stats.aiMessages} detail="public.ai_messages" tone="bg-fuchsia-500" />
        <MetricCard icon={CalendarCheck2} label="Appointments" value={data.stats.appointments} detail="public.appointments" tone="bg-rose-500" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Global network</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Latest registered hubs</h3>
            </div>
            <button onClick={() => setActiveTab('hubs')} className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-100">
              Explore all <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          {data.stats.hubs === null ? (
            <EmptyState title="Hub records are unavailable" description="The dashboard could not read public.global_hubs. See the production data status for the exact connection error." />
          ) : data.hubs.length === 0 ? (
            <EmptyState title="No hub records yet" description="The global_hubs table is connected but currently has no records." />
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.hubs.slice(0, 6).map((hub) => (
                <div key={String(hub.id)} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-cyan-300/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-100">{hub.name || hub.hub_name || 'Unnamed hub record'}</p>
                      <p className="mt-1 text-sm text-slate-400">{hub.country || hub.location || 'Location not recorded'}</p>
                    </div>
                    <Globe2 className="h-4 w-4 shrink-0 text-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Data integrity</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Production data status</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Source</span>
              <span className="font-medium text-slate-200">Supabase production</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Fallback values</span>
              <span className="font-medium text-emerald-300">Disabled</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Last synchronized</span>
              <span className="font-medium text-slate-200">{data.lastSynced ? data.lastSynced.toLocaleTimeString() : 'Not yet synchronized'}</span>
            </div>
            <div className="pt-1 text-xs leading-5 text-slate-500">A zero means the connected table has no rows. A dash means the table could not be read. Neither is substituted with demo data.</div>
          </div>
        </article>
      </section>
    </div>
  );

  const renderHubs = () => (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">public.global_hubs</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Global life-science hub network</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A live directory of registered hub records. Fields are displayed only when present in the production database.</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">{displayCount(data.stats.hubs)} verified records</div>
      </div>
      {data.stats.hubs === null ? (
        <EmptyState title="The hub directory is unavailable" description="No data is being fabricated. Check the production data status and Supabase access configuration." />
      ) : data.hubs.length === 0 ? (
        <EmptyState title="No global hubs have been registered" description="The global_hubs table is connected and ready for real records." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleHubs.map((hub) => {
            const priority = hub.partnership_priority || 'Priority not recorded';
            const title = hub.name || hub.hub_name || 'Unnamed hub record';
            const place = hub.location || hub.country || 'Location not recorded';
            return (
              <article key={String(hub.id)} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-xl hover:shadow-cyan-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/10 p-2.5"><Globe2 className="h-5 w-5 text-cyan-200" /></div>
                  <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">{priority}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-6 text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">{place}</p>
                {hub.specialization_areas && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">{hub.specialization_areas}</p>}
                {hub.strategic_value && <p className="mt-3 line-clamp-3 border-l-2 border-cyan-300/40 pl-3 text-xs leading-5 text-slate-400">{hub.strategic_value}</p>}
                {hub.website && (
                  <a href={hub.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 transition hover:text-cyan-100">
                    Visit official site <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
      {data.hubs.length > visibleHubs.length && <p className="text-center text-sm text-slate-500">Showing the first {visibleHubs.length} live records from {displayCount(data.stats.hubs)} total hubs.</p>}
    </section>
  );

  const renderAgents = () => (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">public.ai_agents</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">AI network</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Each card reflects a registered agent and its stored configuration, not a simulated platform integration.</p>
      </div>
      {data.stats.agents === null ? (
        <EmptyState title="AI-agent records are unavailable" description="The dashboard could not read public.ai_agents; no alternative agent list is displayed." />
      ) : data.agents.length === 0 ? (
        <EmptyState title="No AI agents registered" description="The ai_agents table is connected but currently contains no records." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.agents.map((agent) => {
            const agentType = readConfiguration(agent.configuration, 'type') || 'Type not recorded';
            const statusValue = readConfiguration(agent.configuration, 'status') || 'Status not recorded';
            const description = readConfiguration(agent.configuration, 'description');
            return (
              <article key={agent.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-violet-300/35">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl border border-violet-300/15 bg-violet-300/10 p-2.5"><Bot className="h-5 w-5 text-violet-200" /></div>
                  <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-slate-300">{statusValue}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{agent.name || 'Unnamed agent record'}</h3>
                <p className="mt-2 text-sm text-violet-200/80">{agentType}</p>
                <p className="mt-4 min-h-10 text-sm leading-6 text-slate-400">{description || 'No description recorded for this agent.'}</p>
                <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">Agent ID: {shortId(agent.id)}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderProjectLinks = () => (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">public.agents_projects</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Agent–project links</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">The current production schema stores agent-to-project relationship records. They are presented as links, not relabelled as workspaces.</p>
      </div>
      {data.stats.projectLinks === null ? (
        <EmptyState title="Project-link records are unavailable" description="The dashboard could not read public.agents_projects, so no assignment data is shown." />
      ) : data.projectLinks.length === 0 ? (
        <EmptyState title="No agent–project links registered" description="The agents_projects table is connected but currently contains no relationship records." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr><th className="px-5 py-4 font-semibold">AI agent</th><th className="px-5 py-4 font-semibold">Project reference</th><th className="px-5 py-4 font-semibold">Role</th><th className="px-5 py-4 font-semibold">Permissions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.projectLinks.map((link) => {
                  const agent = link.agent_id ? agentsById.get(link.agent_id) : undefined;
                  return (
                    <tr key={link.id} className="transition hover:bg-slate-800/40">
                      <td className="px-5 py-4"><p className="font-medium text-slate-100">{agent?.name || shortId(link.agent_id)}</p><p className="mt-1 text-xs text-slate-500">{shortId(link.agent_id)}</p></td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{shortId(link.project_id)}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-blue-300/10 px-2.5 py-1 text-xs font-medium text-blue-200">{link.role || 'Role not recorded'}</span></td>
                      <td className="px-5 py-4 text-slate-400">{link.permissions || 'Permissions not recorded'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );

  const renderM23M = () => (
    <section className="space-y-6">
      <div className="rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-900 p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">M2-3M data service</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Research-assistant operational registry</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">This view reports the current contents of the dedicated global M2-3M tables. It does not claim service activation when the registry is empty.</p>
          </div>
          <BrainCircuit className="h-12 w-12 text-violet-200" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Bot} label="Global agents" value={data.stats.m23mAgents} detail="public.global_ai_agents" tone="bg-violet-500" />
        <MetricCard icon={Workflow} label="Global projects" value={data.stats.m23mProjects} detail="public.global_projects" tone="bg-indigo-500" />
        <MetricCard icon={Target} label="Global tasks" value={data.stats.m23mTasks} detail="public.global_tasks" tone="bg-fuchsia-500" />
      </div>
      {data.stats.m23mAgents === 0 && data.stats.m23mProjects === 0 && data.stats.m23mTasks === 0 && (
        <EmptyState title="No M2-3M records registered yet" description="The dedicated M2-3M tables are reachable and currently empty. Register real agents, projects, or tasks in Supabase to populate this view." />
      )}
    </section>
  );

  const renderTelemedicine = () => (
    <section className="space-y-6">
      <div className="rounded-3xl border border-rose-300/15 bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-900 p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">Care operations data</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Telemedicine readiness</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">This operational view is anchored to the current appointment registry. Clinical workflows are not presented as live until appointment data exists.</p>
          </div>
          <HeartPulse className="h-12 w-12 text-rose-200" />
        </div>
      </div>
      <MetricCard icon={CalendarCheck2} label="Registered appointments" value={data.stats.appointments} detail="public.appointments" tone="bg-rose-500" />
      {data.stats.appointments === 0 && <EmptyState title="No appointment records yet" description="The appointments table is connected but currently empty; the platform is correctly withholding a false activity feed." />}
      {data.stats.appointments === null && <EmptyState title="Appointment data is unavailable" description="The dashboard could not read public.appointments. No appointment count or patient activity is being approximated." />}
    </section>
  );

  const content = {
    overview: renderOverview,
    hubs: renderHubs,
    agents: renderAgents,
    projects: renderProjectLinks,
    m23m: renderM23M,
    telemedicine: renderTelemedicine,
  }[activeTab]();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.09),transparent_28%),radial-gradient(circle_at_10%_30%,_rgba(139,92,246,0.08),transparent_25%)]" />
      <header className="relative border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 shadow-lg shadow-cyan-950/30"><Microscope className="h-6 w-6 text-cyan-200" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold tracking-tight text-white">{PLATFORM_NAME}</h1><span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Production</span></div>
              <p className="mt-1 text-sm text-slate-400">{PLATFORM_SUBTITLE} · Tawasol Egypt Life Science Technology Park</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3"><StatusBadge status={status} /><button onClick={() => void loadLiveData()} disabled={isRefreshing || !supabase} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh live data</button></div>
        </div>
        <nav className="mx-auto max-w-7xl overflow-x-auto px-5"><div className="flex min-w-max gap-1">{tabs.map((tab) => { const Icon = tab.icon; const selected = activeTab === tab.id; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition ${selected ? 'border-cyan-300 text-cyan-200' : 'border-transparent text-slate-400 hover:text-slate-100'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}</div></nav>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 py-8 md:py-10">
        {data.errors.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
            <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Live data access needs attention</p><p className="mt-1 leading-6 text-amber-100/75">{data.errors.join(' · ')}</p></div></div>
          </div>
        )}
        {content}
      </main>

      <footer className="relative border-t border-white/10 bg-slate-950/60"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between"><span>TELsTP OmniCognitor · verified production-data interface</span><span className="inline-flex items-center gap-2"><Database className="h-3.5 w-3.5" />Data source: Supabase public schema</span></div></footer>
    </div>
  );
}
