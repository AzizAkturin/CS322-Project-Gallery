'use client';

import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import Link from 'next/link';
import { TOPICS } from '@/lib/topics';
import { ProjectWithId } from '@/lib/types';

type Phase = 'gate' | 'dashboard';
type UploadState = 'idle' | 'uploading' | 'done' | 'error';

function useFileUpload(passphrase: string) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');

  async function uploadFile(file: File) {
    setState('uploading');
    setProgress(0);
    setFileName(file.name);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: passphrase,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setUrl(blob.url);
      setState('done');
    } catch {
      setState('error');
    }
  }

  function reset() {
    setState('idle');
    setProgress(0);
    setUrl('');
    setFileName('');
  }

  return { state, progress, url, fileName, uploadFile, reset };
}

export default function AdminPage() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [authedPass, setAuthedPass] = useState('');

  async function handleGate(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setPassError('');
    try {
      const res = await fetch(`/api/admin?passphrase=${encodeURIComponent(passInput)}`);
      if (res.ok) {
        setAuthedPass(passInput);
        setPhase('dashboard');
      } else {
        setPassError('Incorrect passphrase. Access denied.');
      }
    } catch {
      setPassError('Could not verify. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  if (phase === 'gate') {
    return (
      <div className="min-h-[calc(100vh-112px)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-2">
              &gt; CS322 / Admin
            </p>
            <h1 className="font-instrument-serif text-4xl text-neutral-900 mb-2">Administration</h1>
            <p className="font-sans text-sm text-neutral-500">
              Restricted access. Enter the admin passphrase to continue.
            </p>
          </div>
          <form onSubmit={handleGate} className="bg-white border border-neutral-200 shadow-card p-6 space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-superwide text-neutral-700 mb-1.5">
                Passphrase
              </label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Enter admin passphrase"
                autoFocus
                required
                className="w-full px-3 py-2.5 border border-neutral-200 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            {passError && (
              <p className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 uppercase tracking-superwide">
                {passError}
              </p>
            )}
            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 text-white font-mono text-[10px] uppercase tracking-superwide py-3 transition-colors"
            >
              {verifying ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard passphrase={authedPass} />;
}

function AdminDashboard({ passphrase }: { passphrase: string }) {
  const [projects, setProjects] = useState<ProjectWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', {
        headers: { 'x-admin-passphrase': passphrase },
      });
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [passphrase]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  async function handleApprove(id: string) {
    setActionId(id);
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'x-admin-passphrase': passphrase },
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p._id as string) === id ? { ...p, status: 'approved' } : p)
        );
      } else {
        setActionError('Failed to approve. Try again.');
      }
    } catch {
      setActionError('Failed to approve. Try again.');
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionId(id);
    setActionError('');
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passphrase': passphrase },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => (p._id as string) !== id));
      } else {
        setActionError('Failed to delete. Try again.');
      }
    } catch {
      setActionError('Failed to delete. Try again.');
    } finally {
      setActionId(null);
    }
  }

  const pending = projects.filter((p) => p.status === 'pending');
  const approved = projects.filter((p) => p.status !== 'pending');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

      <div>
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-2">
          &gt; CS322 / Admin
        </p>
        <h1 className="font-instrument-serif text-5xl text-neutral-900 leading-tight mb-2">
          Administration
        </h1>
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-superwide">
          {loading ? 'Loading...' : `${pending.length} pending · ${approved.length} approved`}
        </p>
      </div>

      {actionError && (
        <p className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 uppercase tracking-superwide">
          {actionError}
        </p>
      )}

      {/* Pending Review */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-superwide text-amber-500 mb-1">Pending Review</p>
            <h2 className="font-instrument-serif text-3xl text-neutral-900">
              {loading ? '' : `${pending.length} submission${pending.length !== 1 ? 's' : ''}`}
            </h2>
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : pending.length === 0 ? (
          <div className="bg-white border border-neutral-200 py-12 text-center">
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-2">All clear</p>
            <p className="font-instrument-serif text-xl text-neutral-500">No pending submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((p) => (
              <PendingCard
                key={p._id as string}
                project={p}
                busy={actionId === (p._id as string)}
                onApprove={() => handleApprove(p._id as string)}
                onDelete={() => handleDelete(p._id as string, p.title)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-superwide text-green-600 mb-1">Approved</p>
            <h2 className="font-instrument-serif text-3xl text-neutral-900">
              {loading ? '' : `${approved.length} project${approved.length !== 1 ? 's' : ''}`}
            </h2>
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : approved.length === 0 ? (
          <div className="bg-white border border-neutral-200 py-12 text-center">
            <p className="font-instrument-serif text-xl text-neutral-500">No approved projects yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
            {approved.map((p) => (
              <ProjectRow
                key={p._id as string}
                project={p}
                busy={actionId === (p._id as string)}
                onDelete={() => handleDelete(p._id as string, p.title)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Direct Submit */}
      <AdminSubmitForm passphrase={passphrase} onSuccess={fetchProjects} />
    </div>
  );
}

function PendingCard({
  project, busy, onApprove, onDelete,
}: {
  project: ProjectWithId;
  busy: boolean;
  onApprove: () => void;
  onDelete: () => void;
}) {
  const tags = (project.techStack ?? []).flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);

  return (
    <div className="bg-white border border-neutral-200 overflow-hidden">
      {project.imageUrl && (
        <div className="relative w-full h-52 bg-neutral-100">
          <Image src={project.imageUrl} alt={project.title} fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Title + topic + actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-sans text-base font-semibold text-neutral-900">{project.title}</h3>
              {project.topic && (
                <span className="inline-flex items-center h-[18px] px-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] border border-neutral-200 text-neutral-500 bg-neutral-50 shrink-0">
                  {project.topic}
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-neutral-400">
              {project.studentName}
              {project.createdAt && (
                <span className="ml-3">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {project.linkedinUrl && (
                <a href={project.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="ml-3 text-brand-600 hover:underline">LinkedIn</a>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onApprove} disabled={busy}
              className="h-8 px-4 font-mono text-[0.65rem] uppercase tracking-[0.1em] border border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 disabled:opacity-50 transition-colors">
              {busy ? '...' : 'Approve'}
            </button>
            <button onClick={onDelete} disabled={busy}
              className="h-8 px-4 font-mono text-[0.65rem] uppercase tracking-[0.1em] border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition-colors">
              {busy ? '...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-1.5">Description</p>
          <p className="font-sans text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{project.description}</p>
        </div>

        {/* Tech stack */}
        {tags.length > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-1.5">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center h-[22px] px-2.5 font-mono text-[0.65rem] bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI tools */}
        {project.aiToolsUsed?.trim() && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-1.5">AI Tools Used</p>
            <p className="font-sans text-sm text-neutral-600">{project.aiToolsUsed}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 pt-1 border-t border-neutral-100">
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-superwide text-brand-700 hover:text-brand-600 transition-colors">
            Repository →
          </a>
          {project.videoUrl && (
            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-superwide text-brand-700 hover:text-brand-600 transition-colors">
              Demo Video →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectRow({
  project, busy, onDelete,
}: {
  project: ProjectWithId;
  busy: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-sans text-sm font-medium text-neutral-900 truncate">{project.title}</span>
          {project.topic && (
            <span className="inline-flex items-center h-[18px] px-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] border border-neutral-200 text-neutral-500 bg-neutral-50 shrink-0">
              {project.topic}
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
          {project.studentName}
          {project.createdAt && (
            <span className="ml-3">
              {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 transition-colors">
            Repo
          </a>
        )}
        <Link href={`/projects/${project._id}`}
          className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 transition-colors">
          View
        </Link>
        <button onClick={onDelete} disabled={busy}
          className="h-7 px-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 transition-colors"
        >
          {busy ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-4 animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-52 bg-neutral-200" />
            <div className="h-2.5 w-36 bg-neutral-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 bg-neutral-200" />
            <div className="h-7 w-14 bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSubmitForm({ passphrase, onSuccess }: { passphrase: string; onSuccess: () => void }) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', studentName: '', linkedinUrl: '', description: '',
    topic: '', techStackRaw: '', aiToolsUsed: '', repoUrl: '',
  });

  const image = useFileUpload(passphrase);
  const video = useFileUpload(passphrase);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    await image.uploadFile(file);
  }

  async function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await video.uploadFile(file);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title.trim() || !form.studentName.trim() || !form.description.trim() || !form.repoUrl.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.topic) { setError('Please select a topic.'); return; }
    if (image.state === 'uploading' || video.state === 'uploading') {
      setError('Please wait for uploads to finish.');
      return;
    }

    setSubmitting(true);
    try {
      const techStack = form.techStackRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passphrase': passphrase },
        body: JSON.stringify({ ...form, techStack, imageUrl: image.url || undefined, videoUrl: video.url || undefined }),
      });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const b = await res.json(); msg = b.error ?? msg; } catch { /* not JSON */ }
        throw new Error(msg);
      }
      const project = await res.json();
      setSuccess(`"${project.title}" added to the gallery.`);
      setForm({ title: '', studentName: '', linkedinUrl: '', description: '', topic: '', techStackRaw: '', aiToolsUsed: '', repoUrl: '' });
      image.reset(); video.reset(); setImagePreview('');
      if (imageRef.current) imageRef.current.value = '';
      if (videoRef.current) videoRef.current.value = '';
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-1">Direct Submit</p>
        <h2 className="font-instrument-serif text-3xl text-neutral-900 mb-1">Add a Project</h2>
        <p className="font-sans text-sm text-neutral-500">Published immediately to the gallery.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 shadow-card max-w-2xl">
        <div className="divide-y divide-neutral-100">
          <SectionHeader label="Basic Info" />
          <Field label="Project Title" required>
            <input name="title" value={form.title} onChange={set} maxLength={100}
              placeholder="e.g. AI-Powered Recipe Recommender" className="inp" required />
          </Field>
          <Field label="Student Name" required>
            <input name="studentName" value={form.studentName} onChange={set} maxLength={100}
              placeholder="e.g. Jane Smith" className="inp" required />
          </Field>
          <Field label="LinkedIn" hint="Optional">
            <input name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={set}
              placeholder="https://linkedin.com/in/your-name" className="inp" />
          </Field>

          <SectionHeader label="Project Details" />
          <Field label="Topic" required>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {TOPICS.map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm((f) => ({ ...f, topic: t }))}
                  className={`h-[36px] px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] border text-left truncate transition-colors ${
                    form.topic === t ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-700'
                  }`}>{t}</button>
              ))}
            </div>
          </Field>
          <Field label="Description" required>
            <textarea name="description" value={form.description} onChange={set}
              maxLength={2000} rows={4} className="inp resize-none" required />
            <p className="font-mono text-[10px] text-neutral-400 mt-1 text-right">{form.description.length} / 2000</p>
          </Field>
          <Field label="Tech Stack" hint="Comma-separated">
            <input name="techStackRaw" value={form.techStackRaw} onChange={set}
              placeholder="Flask, MongoDB, Docker" className="inp" />
          </Field>
          <Field label="AI Tools Used" hint="Optional">
            <textarea name="aiToolsUsed" value={form.aiToolsUsed} onChange={set}
              maxLength={500} rows={2} className="inp resize-none" />
          </Field>

          <SectionHeader label="Links & Media" />
          <Field label="Repository URL" required>
            <input name="repoUrl" type="url" value={form.repoUrl} onChange={set}
              placeholder="https://bitbucket.org/..." className="inp" required />
          </Field>
          <Field label="Project Screenshot" hint="Optional — JPG, PNG, WebP, GIF">
            <input ref={imageRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {image.state === 'idle' && (
              <button type="button" onClick={() => imageRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-colors py-8 text-center">
                <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500">Click to upload image</p>
              </button>
            )}
            {image.state === 'uploading' && (
              <div className="border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 truncate max-w-xs">{image.fileName}</p>
                  <span className="font-mono text-[10px] text-neutral-400">{image.progress}%</span>
                </div>
                <div className="h-1 bg-neutral-100 w-full">
                  <div className="h-1 bg-brand-500 transition-all" style={{ width: `${image.progress}%` }} />
                </div>
              </div>
            )}
            {image.state === 'done' && imagePreview && (
              <div className="relative border border-neutral-200 overflow-hidden">
                <Image src={imagePreview} alt="Preview" width={600} height={300} className="w-full h-48 object-cover" unoptimized />
                <button type="button" onClick={() => { image.reset(); setImagePreview(''); if (imageRef.current) imageRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-neutral-900/70 hover:bg-neutral-900 text-white font-mono text-xs w-7 h-7 flex items-center justify-center transition-colors">&times;</button>
              </div>
            )}
            {image.state === 'error' && (
              <div className="border border-red-200 bg-red-50 p-3 flex items-center justify-between">
                <p className="font-mono text-[10px] text-red-600 uppercase tracking-superwide">Upload failed</p>
                <button type="button" onClick={() => { image.reset(); if (imageRef.current) imageRef.current.value = ''; }}
                  className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 underline">Retry</button>
              </div>
            )}
          </Field>
          <Field label="Demo Video" hint="Optional — MP4, MOV, WebM (up to 500 MB)">
            <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            {video.state === 'idle' && (
              <button type="button" onClick={() => videoRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-colors py-8 text-center">
                <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500">Click to upload video</p>
              </button>
            )}
            {video.state === 'uploading' && (
              <div className="border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 truncate max-w-xs">{video.fileName}</p>
                  <span className="font-mono text-[10px] text-neutral-400">{video.progress}%</span>
                </div>
                <div className="h-1 bg-neutral-100 w-full">
                  <div className="h-1 bg-brand-500 transition-all" style={{ width: `${video.progress}%` }} />
                </div>
              </div>
            )}
            {video.state === 'done' && (
              <div className="border border-neutral-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-superwide text-brand-600 mb-0.5">Uploaded</p>
                  <p className="font-mono text-[10px] text-neutral-600 truncate max-w-xs">{video.fileName}</p>
                </div>
                <button type="button" onClick={() => { video.reset(); if (videoRef.current) videoRef.current.value = ''; }}
                  className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 transition-colors">Remove</button>
              </div>
            )}
            {video.state === 'error' && (
              <div className="border border-red-200 bg-red-50 p-3 flex items-center justify-between">
                <p className="font-mono text-[10px] text-red-600 uppercase tracking-superwide">Upload failed</p>
                <button type="button" onClick={() => { video.reset(); if (videoRef.current) videoRef.current.value = ''; }}
                  className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 underline">Retry</button>
              </div>
            )}
          </Field>
        </div>

        <div className="p-6 border-t border-neutral-100">
          {error && (
            <p className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 mb-4 uppercase tracking-superwide">{error}</p>
          )}
          {success && (
            <p className="font-mono text-[10px] text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 mb-4 uppercase tracking-superwide">{success}</p>
          )}
          <button
            type="submit"
            disabled={submitting || image.state === 'uploading' || video.state === 'uploading'}
            className="w-full bg-brand-700 hover:bg-brand-600 disabled:bg-neutral-300 text-white font-mono text-[10px] uppercase tracking-superwide py-3 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting
              </>
            ) : 'Add to Gallery'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .inp { width:100%; padding:0.5rem 0.75rem; border:1px solid #e5e7eb; font-size:0.875rem; font-family:var(--font-geist-sans),sans-serif; background:#fff; outline:none; transition:border-color .15s; }
        .inp:focus { border-color:#171717; }
      `}</style>
    </section>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
      <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500">{label}</p>
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <div className="mb-2.5">
        <span className="font-mono text-[10px] uppercase tracking-superwide text-neutral-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {hint && <p className="font-sans text-xs text-neutral-400 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
