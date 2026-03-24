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

// API functions
async function getTmdbKeys(): Promise<{ items: TmdbApiKey[] }> {
  const { data } = await pluginApi.get('/tmdb-keys');
  return data.data;
}

async function createTmdbKey(body: {
  name: string;
  api_key: string;
  access_token?: string;
}): Promise<{ id: number; name: string }> {
  const { data } = await pluginApi.post('/tmdb-keys', body);
  return data.data;
}

async function deleteTmdbKey(id: number): Promise<void> {
  await pluginApi.delete(`/tmdb-keys/${id}`);
}

async function getMediaLibraryConfig(): Promise<MediaLibraryConfig | null> {
  const { data } = await pluginApi.get('/media-library');
  return data.data;
}

async function saveMediaLibraryConfig(body: {
  name: string;
  db_type: string;
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  table_name: string;
  tmdb_id_column: string;
  media_type_column?: string;
}): Promise<{ id: number; name: string }> {
  const { data } = await pluginApi.post('/media-library', body);
  return data.data;
}

async function deleteMediaLibraryConfig(): Promise<void> {
  await pluginApi.delete('/media-library');
}

async function testMediaLibraryConfig(): Promise<{ success: boolean; message: string }> {
  const { data } = await pluginApi.post('/media-library/test');
  return data.data;
}

// ──────────────────────────────────────────────
//  Media Library Section
// ──────────────────────────────────────────────

function MediaLibrarySection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    db_type: 'postgresql' as string,
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    table_name: '',
    tmdb_id_column: 'tmdb_id',
    media_type_column: '',
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ['media-library-config'],
    queryFn: getMediaLibraryConfig,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveMediaLibraryConfig({
        ...form,
        port: form.port ? Number(form.port) : undefined,
        media_type_column: form.media_type_column || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library-config'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMediaLibraryConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-library-config'] }),
  });

  const testMutation = useMutation({
    mutationFn: testMediaLibraryConfig,
  });

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-white font-['Space_Grotesk']">Media Library Database</h3>
          <p className="text-xs text-[#6a6a6a] mt-1">
            Optional: connect to an external database to check if a title is already in your media library.
            If not configured, all requests are forwarded to the admin panel.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-[#6a6a6a] animate-spin" />
        </div>
      ) : config ? (
        /* Show current config */
        <div className="bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">{config.name}</h4>
              <p className="text-xs text-[#6a6a6a] font-['JetBrains_Mono'] mt-1">
                {config.db_type.toUpperCase()} @ {config.host}:{config.port || (config.db_type === 'postgresql' ? 5432 : 3306)} / {config.database}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#00D9FF] border border-[#00D9FF]/20 hover:bg-[#00D9FF]/10 transition-colors disabled:opacity-40"
              >
                {testMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <FlaskConical size={12} />}
                Test
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-md hover:bg-[#FF4444]/10 text-[#6a6a6a] hover:text-[#FF4444] transition-colors"
                title="Remove config"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#6a6a6a]">Table:</span>{' '}
              <span className="text-white font-['JetBrains_Mono']">{config.table_name}</span>
            </div>
            <div>
              <span className="text-[#6a6a6a]">TMDB ID Column:</span>{' '}
              <span className="text-white font-['JetBrains_Mono']">{config.tmdb_id_column}</span>
            </div>
            <div>
              <span className="text-[#6a6a6a]">Type Column:</span>{' '}
              <span className="text-white font-['JetBrains_Mono']">{config.media_type_column || '\u2014'}</span>
            </div>
          </div>
          {config.is_active && (
            <span className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669]">
              ACTIVE
            </span>
          )}
          {testMutation.data && (
            <p className={`text-xs font-['JetBrains_Mono'] ${testMutation.data.success ? 'text-[#059669]' : 'text-[#FF4444]'}`}>
              {testMutation.data.message}
            </p>
          )}
        </div>
      ) : (
        /* No config -- show add button or form */
        !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-6 bg-[#0A0A0A] border border-dashed border-[#2f2f2f] rounded-[10px] text-sm text-[#6a6a6a] hover:text-white hover:border-[#00D9FF]/30 transition-colors"
          >
            <Database size={20} className="mx-auto mb-2 opacity-50" />
            Configure External Media Library
          </button>
        ) : null
      )}

      {/* Config form */}
      {showForm && !config && (
        <div className="bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Name</label>
              <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="My Media Server" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Database Type</label>
              <select value={form.db_type} onChange={(e) => updateForm('db_type', e.target.value)} className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors">
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Host</label>
              <input type="text" value={form.host} onChange={(e) => updateForm('host', e.target.value)} placeholder="192.168.1.100" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Port</label>
              <input type="text" value={form.port} onChange={(e) => updateForm('port', e.target.value)} placeholder={form.db_type === 'postgresql' ? '5432' : '3306'} className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Database</label>
              <input type="text" value={form.database} onChange={(e) => updateForm('database', e.target.value)} placeholder="media_db" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Username</label>
              <input type="text" value={form.username} onChange={(e) => updateForm('username', e.target.value)} placeholder="db_user" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="********" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Table Name</label>
              <input type="text" value={form.table_name} onChange={(e) => updateForm('table_name', e.target.value)} placeholder="movies" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">TMDB ID Column</label>
              <input type="text" value={form.tmdb_id_column} onChange={(e) => updateForm('tmdb_id_column', e.target.value)} placeholder="tmdb_id" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Media Type Column (optional)</label>
              <input type="text" value={form.media_type_column} onChange={(e) => updateForm('media_type_column', e.target.value)} placeholder="media_type" className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || !form.host || !form.database || !form.username || !form.password || !form.table_name || !form.tmdb_id_column || saveMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00D9FF] text-black text-xs font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-30"
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

// ──────────────────────────────────────────────
//  Main TMDB Tab (exported as default)
// ──────────────────────────────────────────────

export default function TmdbTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formAccessToken, setFormAccessToken] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tmdb-keys'],
    queryFn: getTmdbKeys,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      createTmdbKey({
        name: formName,
        api_key: formApiKey,
        access_token: formAccessToken || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tmdb-keys'] });
      setShowForm(false);
      setFormName('');
      setFormApiKey('');
      setFormAccessToken('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTmdbKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tmdb-keys'] }),
  });

  const keys: TmdbApiKey[] = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-white font-['Space_Grotesk']">TMDB API Keys</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-colors"
        >
          <Plus size={14} />
          Add Key
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="My TMDB Key"
                className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#00D9FF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">API Key</label>
              <input
                type="text"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                placeholder="API key"
                className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Access Token (optional)</label>
              <input
                type="text"
                value={formAccessToken}
                onChange={(e) => setFormAccessToken(e.target.value)}
                placeholder="Bearer token"
                className="w-full h-10 px-3.5 bg-[#141414] border border-[#2f2f2f] rounded-lg text-sm text-white placeholder:text-[#4a4a4a] font-['JetBrains_Mono'] focus:outline-none focus:border-[#00D9FF] transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8a8a] border border-[#2f2f2f] hover:bg-[#141414] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => addMutation.mutate()}
              disabled={!formName || !formApiKey || addMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00D9FF] text-black text-xs font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              {addMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Key cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#6a6a6a] animate-spin" />
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-8 text-center">
          <Key size={24} className="text-[#4a4a4a] mx-auto mb-2" />
          <p className="text-sm text-[#6a6a6a]">No TMDB API keys configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {keys.map((k) => (
            <div
              key={k.id}
              className="bg-[#0A0A0A] border border-[#2f2f2f] rounded-[10px] p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-white">{k.name}</h4>
                  <p className="text-xs text-[#6a6a6a] font-['JetBrains_Mono'] mt-1">{k.api_key_masked}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(k.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-md hover:bg-[#FF4444]/10 text-[#6a6a6a] hover:text-[#FF4444] transition-colors"
                  title="Delete key"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {k.is_active ? (
                  k.is_rate_limited ? (
                    <span className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#FF8800]/10 text-[#FF8800]">
                      RATE LIMITED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669]">
                      ACTIVE
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-semibold font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-[#141414] text-[#6a6a6a]">
                    INACTIVE
                  </span>
                )}
                <span className="text-[10px] text-[#6a6a6a] font-['JetBrains_Mono']">
                  {k.request_count} requests
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Library Config */}
      <MediaLibrarySection />
    </div>
  );
}
