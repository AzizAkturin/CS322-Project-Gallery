'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import { TOPICS } from '@/lib/topics';
import { extractYouTubeId } from '@/lib/video';
import TechStackPicker from '@/components/TechStackPicker';

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

export default function SubmitPage() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    studentName: '',
    linkedinUrl: '',
    tagline: '',
    description: '',
    topic: '',
    aiToolsUsed: '',
    repoUrl: '',
    classPassphrase: '',
  });

  const [techStack, setTechStack] = useState<string[]>([]);
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>('url');
  const [videoUrlRaw, setVideoUrlRaw] = useState('');

  const image = useFileUpload(form.classPassphrase);
  const video = useFileUpload(form.classPassphrase);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.classPassphrase.trim()) {
      setError('Enter the class passphrase before uploading files.');
      if (imageRef.current) imageRef.current.value = '';
      return;
    }
    setError('');
    setImagePreview(URL.createObjectURL(file));
    await image.uploadFile(file);
  }

  async function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.classPassphrase.trim()) {
      setError('Enter the class passphrase before uploading files.');
      if (videoRef.current) videoRef.current.value = '';
      return;
    }
    setError('');
    await video.uploadFile(file);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.studentName.trim() || !form.description.trim() || !form.repoUrl.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.topic) {
      setError('Please select a topic.');
      return;
    }
    if (!form.classPassphrase.trim()) {
      setError('Please enter the class passphrase.');
      return;
    }
    if (image.state === 'uploading' || video.state === 'uploading') {
      setError('Please wait for uploads to finish.');
      return;
    }

    const finalVideoUrl =
      videoMode === 'url'
        ? videoUrlRaw.trim() || undefined
        : video.url || undefined;

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          techStack,
          imageUrl: image.url || undefined,
          videoUrl: finalVideoUrl,
        }),
      });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const b = await res.json(); msg = b.error ?? msg; } catch { /* not JSON */ }
        throw new Error(msg);
      }
      router.push('/submit/success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  const ytPreviewId = videoMode === 'url' ? extractYouTubeId(videoUrlRaw) : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-2">
          &gt; CS322 / Submit
        </p>
        <h1 className="font-instrument-serif text-4xl text-neutral-900 mb-2">Submit Your Project</h1>
        <p className="font-sans text-sm text-neutral-500">Submit your CS322 final project for review. It will appear in the gallery once approved.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 shadow-card">
        <div className="divide-y divide-neutral-100">

          {/* ── Basic Info ── */}
          <SectionHeader label="Basic Info" />

          <Field label="Project Title" required>
            <input name="title" value={form.title} onChange={set} maxLength={100}
              placeholder="e.g. AI-Powered Recipe Recommender" className="inp" required />
          </Field>

          <Field label="Your Name" required>
            <input name="studentName" value={form.studentName} onChange={set} maxLength={100}
              placeholder="e.g. Jane Smith" className="inp" required />
          </Field>

          <Field label="LinkedIn" hint="Optional — paste your profile URL">
            <input name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={set}
              placeholder="https://linkedin.com/in/your-name" className="inp" />
          </Field>

          {/* ── Project Details ── */}
          <SectionHeader label="Project Details" />

          <Field label="Topic" required hint="Pick the category that fits your project best">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, topic: t }))}
                  className={`h-[36px] px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] border text-left truncate transition-colors ${
                    form.topic === t
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tagline" hint="One-sentence summary shown on the gallery card — e.g. &ldquo;A recipe recommender powered by GPT-4&rdquo;">
            <input name="tagline" value={form.tagline} onChange={set} maxLength={200}
              placeholder="A short, catchy one-liner for your project" className="inp" />
            <p className="font-mono text-[10px] text-neutral-400 mt-1 text-right">{form.tagline.length} / 200</p>
          </Field>

          <Field label="Description" required hint="Full explanation — what it does, how it works, what you built">
            <textarea name="description" value={form.description} onChange={set}
              maxLength={2000} rows={5} className="inp resize-none" required />
            <p className="font-mono text-[10px] text-neutral-400 mt-1 text-right">{form.description.length} / 2000</p>
          </Field>

          <Field label="Tech Stack" hint="Click to select — or type a custom technology and press Enter">
            <TechStackPicker selected={techStack} onChange={setTechStack} />
          </Field>

          <Field label="AI Tools Used" hint="Optional — describe which AI tools you used and how">
            <textarea name="aiToolsUsed" value={form.aiToolsUsed} onChange={set}
              maxLength={500} rows={2} className="inp resize-none" />
          </Field>

          {/* ── Links & Media ── */}
          <SectionHeader label="Links & Media" />

          <Field label="Repository URL" required>
            <input name="repoUrl" type="url" value={form.repoUrl} onChange={set}
              placeholder="https://bitbucket.org/your-name/your-project" className="inp" required />
          </Field>

          {/* Screenshot upload */}
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
                  className="absolute top-2 right-2 bg-neutral-900/70 hover:bg-neutral-900 text-white font-mono text-xs w-7 h-7 flex items-center justify-center transition-colors">
                  &times;
                </button>
              </div>
            )}
            {image.state === 'error' && (
              <div className="border border-red-200 bg-red-50 p-3 flex items-center justify-between">
                <p className="font-mono text-[10px] text-red-600 uppercase tracking-superwide">Upload failed</p>
                <button type="button" onClick={() => { image.reset(); if (imageRef.current) imageRef.current.value = ''; }}
                  className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 underline">
                  Retry
                </button>
              </div>
            )}
          </Field>

          {/* Demo video — YouTube URL or file upload */}
          <Field label="Demo Video" hint="Optional — paste a YouTube link or upload an MP4/MOV/WebM file">
            {/* Mode toggle */}
            <div className="flex mb-3 border border-neutral-200 w-fit">
              <button
                type="button"
                onClick={() => { setVideoMode('url'); video.reset(); if (videoRef.current) videoRef.current.value = ''; }}
                className={`h-7 px-4 font-mono text-[0.65rem] uppercase tracking-[0.1em] transition-colors ${
                  videoMode === 'url' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 hover:text-neutral-900'
                }`}
              >
                YouTube / URL
              </button>
              <button
                type="button"
                onClick={() => { setVideoMode('upload'); setVideoUrlRaw(''); }}
                className={`h-7 px-4 font-mono text-[0.65rem] uppercase tracking-[0.1em] border-l border-neutral-200 transition-colors ${
                  videoMode === 'upload' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Upload File
              </button>
            </div>

            {videoMode === 'url' ? (
              <div>
                <input
                  type="url"
                  value={videoUrlRaw}
                  onChange={(e) => setVideoUrlRaw(e.target.value)}
                  placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                  className="inp"
                />
                {ytPreviewId && (
                  <div className="mt-2 border border-neutral-200 overflow-hidden relative h-40">
                    <Image
                      src={`https://img.youtube.com/vi/${ytPreviewId}/hqdefault.jpg`}
                      alt="YouTube thumbnail preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 rounded-full w-10 h-10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.79 5.093L11 8 6.79 10.907V5.093z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <input ref={videoRef} type="file" accept="video/*,.mp4,.mov,.webm,.m4v" onChange={handleVideoChange} className="hidden" />
                {video.state === 'idle' && (
                  <button type="button" onClick={() => videoRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-colors py-8 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500">Click to upload video</p>
                    <p className="font-sans text-xs text-neutral-400 mt-1">MP4, MOV, WebM — up to 500 MB</p>
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
                      className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 transition-colors">
                      Remove
                    </button>
                  </div>
                )}
                {video.state === 'error' && (
                  <div className="border border-red-200 bg-red-50 p-3 flex items-center justify-between">
                    <p className="font-mono text-[10px] text-red-600 uppercase tracking-superwide">Upload failed</p>
                    <button type="button" onClick={() => { video.reset(); if (videoRef.current) videoRef.current.value = ''; }}
                      className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-900 underline">
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}
          </Field>

          {/* ── Access ── */}
          <SectionHeader label="Access" />

          <Field label="Class Passphrase" required hint="Ask your instructor for the passphrase">
            <input name="classPassphrase" type="password" value={form.classPassphrase} onChange={set}
              placeholder="Enter class passphrase" className="inp" required />
          </Field>

        </div>

        {/* Submit */}
        <div className="p-6 border-t border-neutral-100">
          {error && (
            <p className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 mb-4 uppercase tracking-superwide">
              {error}
            </p>
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
            ) : 'Submit Project'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .inp { width:100%; padding:0.5rem 0.75rem; border:1px solid #e5e7eb; font-size:0.875rem; font-family:var(--font-geist-sans),sans-serif; background:#fff; outline:none; transition:border-color .15s; }
        .inp:focus { border-color:#171717; }
      `}</style>
    </div>
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
