import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Film,
  Loader2,
  Check,
  X,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import pluginApi from '../api';

// Types
interface MovieRequest {
  id: number;
  tmdb_id: number;
  media_type: string;
  title: string;
  original_title?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  overview?: string;
  vote_average?: number;
  genres?: string;
  status: string;
  admin_note?: string;
  request_count: number;
  in_library: boolean;
  requested_resolution?: string | null;
  created_at: string;
  updated_at: string;
}

interface MovieRequestStats {
  total: number;
  pending: number;
  fulfilled: number;
  rejected: number;
}

interface PaginatedResponse {
  items: MovieRequest[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// API
async function getMovieRequestStats(): Promise<MovieRequestStats> {
  const { data } = await pluginApi.get('/stats');
  return data.data;
}

async function getMovieRequests(params: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<PaginatedResponse> {
  const { data } = await pluginApi.get('', { params });
  return data.data;
}

async function updateMovieRequest(
  id: number,
  body: { status?: string; admin_note?: string }
): Promise<MovieRequest> {
  const { data } = await pluginApi.patch(`/${id}`, body);
  return data.data;
}

async function deleteMovieRequest(id: number): Promise<void> {
  await pluginApi.delete(`/${id}`);
}

// Inline styles using CSS variables (plugins can't use host Tailwind theme classes)
const cv = (name: string) => `var(--color-${name})`;

const STATUS_TABS = ['all', 'pending', 'fulfilled', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="rounded-[10px] p-5"
      style={{
        background: cv('bg-card'),
        border: `1px solid ${cv('border')}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} style={{ color }} />
        <span
          className="text-[13px] font-medium font-['Inter']"
          style={{ color: cv('text-secondary') }}
        >
          {label}
        </span>
      </div>
      <span
        className="text-[32px] font-bold font-['Space_Grotesk'] leading-none"
        style={{ color }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    pending: { color: cv('orange'), label: 'PENDING' },
    fulfilled: { color: cv('green'), label: 'FULFILLED' },
    rejected: { color: cv('red'), label: 'REJECTED' },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded"
      style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 10%, transparent)` }}
    >
      {c.label}
    </span>
  );
}

function MediaTypeBadge({ type }: { type: string }) {
  return (
    <span
      className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded"
      style={{ color: cv('purple'), background: `color-mix(in srgb, ${cv('purple')} 10%, transparent)` }}
    >
      {type.toUpperCase()}
    </span>
  );
}

export default function MovieRequests() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['movie-request-stats'],
    queryFn: getMovieRequestStats,
    staleTime: 30_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['movie-requests', activeTab, page],
    queryFn: () =>
      getMovieRequests({
        page,
        page_size: 20,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      setMutatingId(id);
      return updateMovieRequest(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie-requests'] });
      queryClient.invalidateQueries({ queryKey: ['movie-request-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update request:', error.message);
    },
    onSettled: () => {
      setMutatingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      setMutatingId(id);
      return deleteMovieRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie-requests'] });
      queryClient.invalidateQueries({ queryKey: ['movie-request-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete request:', error.message);
    },
    onSettled: () => {
      setMutatingId(null);
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-8 pt-6 pb-0" style={{ background: cv('bg-page') }}>
        <h1
          className="text-[28px] font-bold font-['Space_Grotesk']"
          style={{ color: cv('text-primary') }}
        >
          Movie Requests
        </h1>
        <p className="text-sm mt-0.5" style={{ color: cv('text-muted') }}>
          Manage TMDB movie and TV show requests from users
        </p>
      </header>

      <div className="flex-1 px-8 py-6 overflow-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Received" value={stats?.total ?? 0} icon={BarChart3} color={cv('accent')} />
          <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} color={cv('orange')} />
          <StatCard label="Fulfilled" value={stats?.fulfilled ?? 0} icon={CheckCircle} color={cv('green')} />
          <StatCard label="Rejected" value={stats?.rejected ?? 0} icon={XCircle} color={cv('red')} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6" style={{ borderBottom: `1px solid ${cv('border-subtle')}` }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className="pb-3 text-sm font-medium transition-colors relative capitalize"
                style={{ color: isActive ? cv('accent') : cv('text-muted') }}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: cv('accent') }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: cv('bg-card'), border: `1px solid ${cv('border')}` }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${cv('border')}` }}>
                {['Poster', 'Title', 'TMDB', 'Rating', 'Requests', 'Library', 'Status', 'Actions'].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`text-[11px] font-semibold uppercase tracking-[0.5px] font-['JetBrains_Mono'] px-5 py-3 ${
                        i === 0 || i === 1 || i === 2 ? 'text-left' : i === 7 ? 'text-right' : 'text-center'
                      }`}
                      style={{ color: cv('text-muted'), width: i === 0 ? '60px' : undefined }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: cv('text-muted') }} />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Film className="w-10 h-10 mx-auto mb-3" style={{ color: cv('text-placeholder') }} />
                    <p className="text-sm" style={{ color: cv('text-muted') }}>No requests found</p>
                  </td>
                </tr>
              ) : (
                items.map((req: MovieRequest) => {
                  const year = req.release_date?.slice(0, 4) || 'N/A';
                  const tmdbUrl =
                    req.media_type === 'movie'
                      ? `https://www.themoviedb.org/movie/${req.tmdb_id}`
                      : `https://www.themoviedb.org/tv/${req.tmdb_id}`;
                  return (
                    <tr
                      key={req.id}
                      className="transition-colors"
                      style={{ borderBottom: `1px solid ${cv('border-subtle')}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `color-mix(in srgb, ${cv('bg-elevated')} 50%, transparent)`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-3">
                        {req.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${req.poster_path}`}
                            alt={req.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div
                            className="w-10 h-14 rounded flex items-center justify-center"
                            style={{ background: cv('bg-elevated') }}
                          >
                            <Film size={16} style={{ color: cv('text-placeholder') }} />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-sm font-medium truncate max-w-[240px]"
                            style={{ color: cv('text-primary') }}
                          >
                            {req.title}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: cv('text-muted') }}>{year}</span>
                            <MediaTypeBadge type={req.media_type} />
                            {req.requested_resolution && (
                              <span
                                className="text-[9px] font-semibold font-['JetBrains_Mono'] px-1.5 py-0.5 rounded uppercase"
                                style={{
                                  color: cv('orange'),
                                  background: `color-mix(in srgb, ${cv('orange')} 12%, transparent)`,
                                }}
                                title="Supplement request for this resolution"
                              >
                                补片 {req.requested_resolution}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <a
                          href={tmdbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs hover:underline font-['JetBrains_Mono']"
                          style={{ color: cv('accent') }}
                        >
                          {req.tmdb_id}
                          <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-sm font-['JetBrains_Mono']" style={{ color: cv('text-primary') }}>
                          {req.vote_average != null ? `\u2B50 ${Number(req.vote_average).toFixed(1)}` : '\u2014'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className="text-sm font-semibold font-['Space_Grotesk']"
                          style={{ color: cv('accent') }}
                        >
                          {req.request_count}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {req.in_library ? (
                          <span
                            className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded"
                            style={{ color: cv('green'), background: `color-mix(in srgb, ${cv('green')} 10%, transparent)` }}
                          >
                            YES
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded"
                            style={{ color: cv('text-muted'), background: cv('bg-elevated') }}
                          >
                            NO
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-1 justify-end">
                            {mutatingId === req.id ? (
                              <Loader2 size={16} className="animate-spin" style={{ color: cv('text-muted') }} />
                            ) : (
                              <>
                                <button
                                  onClick={() => mutation.mutate({ id: req.id, status: 'fulfilled' })}
                                  disabled={mutatingId !== null}
                                  className="p-1.5 rounded-md transition-all disabled:opacity-30"
                                  style={{ color: cv('text-muted') }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = cv('green');
                                    e.currentTarget.style.background = `color-mix(in srgb, ${cv('green')} 10%, transparent)`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = cv('text-muted');
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  title="Fulfill"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => mutation.mutate({ id: req.id, status: 'rejected' })}
                                  disabled={mutatingId !== null}
                                  className="p-1.5 rounded-md transition-all disabled:opacity-30"
                                  style={{ color: cv('text-muted') }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = cv('red');
                                    e.currentTarget.style.background = `color-mix(in srgb, ${cv('red')} 10%, transparent)`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = cv('text-muted');
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  title="Reject"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => { if (confirm('Delete this request permanently?')) deleteMutation.mutate(req.id); }}
                              disabled={mutatingId !== null}
                              className="p-1.5 rounded-md transition-all disabled:opacity-30"
                              style={{ color: cv('text-muted') }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = cv('red');
                                e.currentTarget.style.background = `color-mix(in srgb, ${cv('red')} 10%, transparent)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = cv('text-muted');
                                e.currentTarget.style.background = 'transparent';
                              }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: cv('text-muted') }}>
              {total} total results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-30"
                style={{ color: cv('text-secondary'), border: `1px solid ${cv('border')}` }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-xs font-['JetBrains_Mono']" style={{ color: cv('text-secondary') }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-30"
                style={{ color: cv('text-secondary'), border: `1px solid ${cv('border')}` }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
