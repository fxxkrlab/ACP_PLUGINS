import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  Loader2,
  Key,
  Database,
  FlaskConical,
  Save,
} from 'lucide-react';
import pluginApi from '../api';

const cv = (name: string) => `var(--color-${name})`;

// Shared input style
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  padding: '0 14px',
  background: cv('bg-elevated'),
  border: `1px solid ${cv('border')}`,
  borderRadius: 8,
  fontSize: 14,
  color: cv('text-primary'),
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: cv('text-muted'),
  marginBottom: 6,
};

const cardStyle: React.CSSProperties = {
  background: cv('bg-card'),
  border: `1px solid ${cv('border')}`,
  borderRadius: 10,
  padding: 20,
};

// Types
interface TmdbApiKey {
  id: number;
  name: string;
  api_key_masked: string;
  access_token_masked?: string;
  is_active: boolean;
  is_rate_limited: boolean;
  rate_limited_until?: string;
  request_count: number;
  created_at: string;
  updated_at: string;
}

interface MediaLibraryConfig {
  id: number;
  name: string;
  db_type: string;
  host: string;
  port?: number;
  database: string;
  username: string;
  password_masked: string;
  table_name: string;
  tmdb_id_column: string;
  media_type_column?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API
async function getTmdbKeys(): Promise<{ items: TmdbApiKey[] }> {
  const { data } = await pluginApi.get('/tmdb-keys');
  return data.data;
}
async function createTmdbKey(body: { name: string; api_key: string; access_token?: string }) {
  const { data } = await pluginApi.post('/tmdb-keys', body);
  return data.data;
}
async function deleteTmdbKey(id: number) { await pluginApi.delete(`/tmdb-keys/${id}`); }
async function getMediaLibraryConfig(): Promise<MediaLibraryConfig | null> {
  const { data } = await pluginApi.get('/media-library');
  return data.data;
}
async function saveMediaLibraryConfig(body: Record<string, unknown>) {
  const { data } = await pluginApi.post('/media-library', body);
  return data.data;
}
async function deleteMediaLibraryConfig() { await pluginApi.delete('/media-library'); }
async function testMediaLibraryConfig() {
  const { data } = await pluginApi.post('/media-library/test');
  return data.data as { success: boolean; message: string };
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded"
      style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      {label}
    </span>
  );
}

// ── Media Library Section ──
function MediaLibrarySection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', db_type: 'postgresql', host: '', port: '', database: '',
    username: '', password: '', table_name: '', tmdb_id_column: 'tmdb_id', media_type_column: '',
  });

  const { data: config, isLoading } = useQuery({ queryKey: ['media-library-config'], queryFn: getMediaLibraryConfig });
  const saveMutation = useMutation({
    mutationFn: () => saveMediaLibraryConfig({ ...form, port: form.port ? Number(form.port) : undefined, media_type_column: form.media_type_column || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['media-library-config'] }); setShowForm(false); },
  });
  const deleteMutation = useMutation({ mutationFn: deleteMediaLibraryConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-library-config'] }) });
  const testMutation = useMutation({ mutationFn: testMediaLibraryConfig });
  const u = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4 mt-8">
      <div>
        <h3 className="text-[18px] font-semibold font-['Space_Grotesk']" style={{ color: cv('text-primary') }}>Media Library Database</h3>
        <p className="text-xs mt-1" style={{ color: cv('text-muted') }}>
          Optional: connect to an external database to check if a title is already in your media library.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: cv('text-muted') }} />
        </div>
      ) : config ? (
        <div style={cardStyle} className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium" style={{ color: cv('text-primary') }}>{config.name}</h4>
              <p className="text-xs font-['JetBrains_Mono'] mt-1" style={{ color: cv('text-muted') }}>
                {config.db_type.toUpperCase()} @ {config.host}:{config.port || (config.db_type === 'postgresql' ? 5432 : 3306)} / {config.database}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-40"
                style={{ color: cv('accent'), border: `1px solid color-mix(in srgb, ${cv('accent')} 20%, transparent)` }}
              >
                {testMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <FlaskConical size={12} />}
                Test
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: cv('text-muted') }}
                onMouseEnter={(e) => { e.currentTarget.style.color = cv('red'); }}
                onMouseLeave={(e) => { e.currentTarget.style.color = cv('text-muted'); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[['Table', config.table_name], ['TMDB ID Column', config.tmdb_id_column], ['Type Column', config.media_type_column || '\u2014']].map(([l, v]) => (
              <div key={l}><span style={{ color: cv('text-muted') }}>{l}:</span>{' '}<span className="font-['JetBrains_Mono']" style={{ color: cv('text-primary') }}>{v}</span></div>
            ))}
          </div>
          {config.is_active && <Badge label="ACTIVE" color={cv('green')} />}
          {testMutation.data && (
            <p className="text-xs font-['JetBrains_Mono']" style={{ color: testMutation.data.success ? cv('green') : cv('red') }}>
              {testMutation.data.message}
            </p>
          )}
        </div>
      ) : !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-6 rounded-[10px] text-sm transition-colors"
          style={{ background: cv('bg-card'), border: `1px dashed ${cv('border')}`, color: cv('text-muted') }}
        >
          <Database size={20} className="mx-auto mb-2 opacity-50" />
          Configure External Media Library
        </button>
      ) : null}

      {showForm && !config && (
        <div style={cardStyle} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[['Name', 'name', 'My Media Server'], ['Database Type', 'db_type', ''], ['Host', 'host', '192.168.1.100']].map(([label, key, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                {key === 'db_type' ? (
                  <select value={form.db_type} onChange={(e) => u('db_type', e.target.value)} style={inputStyle}>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                  </select>
                ) : (
                  <input type="text" value={(form as Record<string, string>)[key]} onChange={(e) => u(key, e.target.value)} placeholder={ph} style={inputStyle} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[['Port', 'port', form.db_type === 'postgresql' ? '5432' : '3306'], ['Database', 'database', 'media_db'], ['Username', 'username', 'db_user'], ['Password', 'password', '********']].map(([label, key, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={key === 'password' ? 'password' : 'text'} value={(form as Record<string, string>)[key]} onChange={(e) => u(key, e.target.value)} placeholder={ph} style={inputStyle} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['Table Name', 'table_name', 'movies'], ['TMDB ID Column', 'tmdb_id_column', 'tmdb_id'], ['Media Type Column', 'media_type_column', 'media_type']].map(([label, key, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}{key === 'media_type_column' ? ' (optional)' : ''}</label>
                <input type="text" value={(form as Record<string, string>)[key]} onChange={(e) => u(key, e.target.value)} placeholder={ph} style={inputStyle} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors" style={{ color: cv('text-secondary'), border: `1px solid ${cv('border')}` }}>Cancel</button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || !form.host || !form.database || !form.username || !form.password || !form.table_name || !form.tmdb_id_column || saveMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-black text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-30"
              style={{ background: cv('accent') }}
            >
              {saveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TMDB Tab ──
export default function TmdbTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formAccessToken, setFormAccessToken] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['tmdb-keys'], queryFn: getTmdbKeys });
  const addMutation = useMutation({
    mutationFn: () => createTmdbKey({ name: formName, api_key: formApiKey, access_token: formAccessToken || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tmdb-keys'] }); setShowForm(false); setFormName(''); setFormApiKey(''); setFormAccessToken(''); },
  });
  const deleteMutation = useMutation({ mutationFn: (id: number) => deleteTmdbKey(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tmdb-keys'] }) });

  const keys: TmdbApiKey[] = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold font-['Space_Grotesk']" style={{ color: cv('text-primary') }}>TMDB API Keys</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ color: cv('accent'), background: `color-mix(in srgb, ${cv('accent')} 10%, transparent)` }}
        >
          <Plus size={14} /> Add Key
        </button>
      </div>

      {showForm && (
        <div style={cardStyle} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Name</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="My TMDB Key" style={{ ...inputStyle, fontFamily: "'Inter', sans-serif" }} />
            </div>
            <div>
              <label style={labelStyle}>API Key</label>
              <input type="text" value={formApiKey} onChange={(e) => setFormApiKey(e.target.value)} placeholder="API key" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Access Token (optional)</label>
              <input type="text" value={formAccessToken} onChange={(e) => setFormAccessToken(e.target.value)} placeholder="Bearer token" style={inputStyle} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors" style={{ color: cv('text-secondary'), border: `1px solid ${cv('border')}` }}>Cancel</button>
            <button
              onClick={() => addMutation.mutate()}
              disabled={!formName || !formApiKey || addMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-black text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-30"
              style={{ background: cv('accent') }}
            >
              {addMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Add
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: cv('text-muted') }} />
        </div>
      ) : keys.length === 0 ? (
        <div style={cardStyle} className="text-center py-4">
          <Key size={24} className="mx-auto mb-2" style={{ color: cv('text-placeholder') }} />
          <p className="text-sm" style={{ color: cv('text-muted') }}>No TMDB API keys configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {keys.map((k) => (
            <div key={k.id} style={cardStyle}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: cv('text-primary') }}>{k.name}</h4>
                  <p className="text-xs font-['JetBrains_Mono'] mt-1" style={{ color: cv('text-muted') }}>{k.api_key_masked}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(k.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: cv('text-muted') }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = cv('red'); }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = cv('text-muted'); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {k.is_active ? (
                  k.is_rate_limited
                    ? <Badge label="RATE LIMITED" color={cv('orange')} />
                    : <Badge label="ACTIVE" color={cv('green')} />
                ) : (
                  <span className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded" style={{ color: cv('text-muted'), background: cv('bg-elevated') }}>INACTIVE</span>
                )}
                <span className="text-[10px] font-['JetBrains_Mono']" style={{ color: cv('text-muted') }}>{k.request_count} requests</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaLibrarySection />
    </div>
  );
}
