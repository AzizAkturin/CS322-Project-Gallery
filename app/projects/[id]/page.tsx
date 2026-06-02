import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/lib/types';
import { topicBadge } from '@/lib/topics';

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url) || url.includes('blob.vercel-storage.com');
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const client = await clientPromise;
  const doc = await client.db('cs322gallery').collection<Project>('projects').findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  const submitted = new Date(doc.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const tags = doc.techStack.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-superwide text-neutral-400 hover:text-neutral-800 transition-colors mb-10">
        &larr; Gallery
      </Link>

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 bg-neutral-100 border border-neutral-200 overflow-hidden mb-10">
        {doc.imageUrl ? (
          <Image src={doc.imageUrl} alt={doc.title} fill className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px" priority />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">No preview image</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {doc.topic && (
                <span className={`inline-flex items-center h-[20px] px-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] border ${topicBadge(doc.topic)}`}>
                  {doc.topic}
                </span>
              )}
              <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400">
                {submitted}
              </p>
            </div>
            <h1 className="font-instrument-serif text-4xl sm:text-5xl text-neutral-900 leading-tight mb-3">
              {doc.title}
            </h1>

            {/* Student info */}
            <div className="flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-superwide text-neutral-500">
                {doc.studentName}
              </p>
              {doc.linkedinUrl && (
                <a href={doc.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-[22px] px-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors">
                  LinkedIn &rarr;
                </a>
              )}
            </div>
          </div>

          <Section label="About">
            <p className="font-sans text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{doc.description}</p>
          </Section>

          {doc.aiToolsUsed && (
            <Section label="AI Tools Used">
              <p className="font-sans text-sm text-neutral-700 leading-relaxed">{doc.aiToolsUsed}</p>
            </Section>
          )}

          {/* Demo video */}
          {doc.videoUrl && (
            <Section label="Demo">
              {isVideoUrl(doc.videoUrl) ? (
                <video
                  src={doc.videoUrl}
                  controls
                  className="w-full border border-neutral-200"
                  style={{ maxHeight: '400px' }}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <a href={doc.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-superwide text-brand-700 hover:text-brand-500 transition-colors">
                  Watch Demo &rarr;
                </a>
              )}
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {tags.length > 0 && (
            <Section label="Tech Stack">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t}
                    className="inline-flex items-center h-[22px] px-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] bg-brand-100 border border-brand-300 text-brand-800">
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section label="Links">
            <div className="flex flex-col gap-2.5">
              <a href={doc.repoUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-superwide text-brand-700 hover:text-brand-500 transition-colors">
                Repository &rarr;
              </a>
              {doc.linkedinUrl && (
                <a href={doc.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-superwide text-sky-600 hover:text-sky-800 transition-colors">
                  LinkedIn &rarr;
                </a>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400 mb-3">{label}</p>
      {children}
    </div>
  );
}
