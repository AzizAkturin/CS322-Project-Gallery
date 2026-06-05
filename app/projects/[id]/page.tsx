import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/lib/types';
import { topicBadge } from '@/lib/topics';
import { extractYouTubeId, isDirectVideoUrl } from '@/lib/video';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const client = await clientPromise();
  const doc = await client.db('cs322gallery').collection<Project>('projects').findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  const submitted = new Date(doc.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const tags = doc.techStack.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);

  const ytId = doc.videoUrl ? extractYouTubeId(doc.videoUrl) : null;
  const hasDirectVideo = !ytId && doc.videoUrl ? isDirectVideoUrl(doc.videoUrl) : false;

  // Uploaded screenshot takes priority; fall back to YouTube thumbnail
  const heroSrc = doc.imageUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-superwide text-neutral-500 hover:text-neutral-800 transition-colors mb-8"
      >
        &larr; Gallery
      </Link>

      {/* Page title — full width above grid */}
      <div className="mb-7">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {doc.topic && (
            <span className={`inline-flex items-center h-[20px] px-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] border ${topicBadge(doc.topic)}`}>
              {doc.topic}
            </span>
          )}
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">{submitted}</p>
        </div>
        <h1 className="font-instrument-serif text-4xl sm:text-5xl text-neutral-900 leading-tight mb-2">
          {doc.title}
        </h1>
        {doc.tagline && (
          <p className="font-sans text-lg text-neutral-500 italic">{doc.tagline}</p>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Preview image */}
          <div className="relative h-60 sm:h-72 overflow-hidden bg-neutral-100 border border-neutral-200">
            {heroSrc ? (
              <Image
                src={heroSrc}
                alt={doc.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
                unoptimized={!!ytId}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">No preview</p>
              </div>
            )}
          </div>

          {/* Bio — immediately after preview */}
          <Card label="About">
            <p className="font-sans text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {doc.description}
            </p>
          </Card>

          {/* Video Demo */}
          {doc.videoUrl && (
            <Card label="Video Demo" noPad>
              {ytId ? (
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="Demo video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : hasDirectVideo ? (
                <video src={doc.videoUrl} controls className="w-full bg-black" style={{ maxHeight: 360 }}>
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="p-6">
                  <a href={doc.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-superwide text-brand-700 hover:text-brand-500 transition-colors">
                    Watch Demo &rarr;
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* AI Tools */}
          {doc.aiToolsUsed && (
            <Card label="AI Tools Used">
              <p className="font-sans text-sm text-neutral-700 leading-relaxed">{doc.aiToolsUsed}</p>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Links */}
          <Card label="Links">
            <div className="flex flex-col gap-2">
              <a
                href={doc.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-700 text-white font-mono text-[10px] uppercase tracking-superwide transition-colors"
              >
                Repository
                <span>&rarr;</span>
              </a>

              {doc.videoUrl && (
                <a
                  href={doc.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-mono text-[10px] uppercase tracking-superwide transition-colors"
                >
                  Watch Demo
                  <span>&rarr;</span>
                </a>
              )}

              {doc.linkedinUrl && (
                <a
                  href={doc.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 border border-neutral-200 hover:border-neutral-900 bg-white text-neutral-900 font-mono text-[10px] uppercase tracking-superwide transition-colors"
                >
                  LinkedIn
                  <span className="text-neutral-400">&rarr;</span>
                </a>
              )}
            </div>
          </Card>

          {/* Tech Stack */}
          {tags.length > 0 && (
            <Card label="Tech Stack">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-[22px] px-2.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] bg-brand-100 border border-brand-300 text-brand-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Student */}
          <Card label="Student">
            <p className="font-instrument-serif text-xl text-neutral-900 mb-0.5">{doc.studentName}</p>
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">
              {submitted}
            </p>
            {doc.linkedinUrl && (
              <a
                href={doc.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 h-[22px] px-2.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                LinkedIn &rarr;
              </a>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}

function Card({ label, children, noPad }: { label: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="bg-white border border-neutral-200 overflow-hidden">
      <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50">
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">{label}</p>
      </div>
      <div className={noPad ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
