'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProjectWithId } from '@/lib/types';
import { topicBadge } from '@/lib/topics';

function parseTags(stack: string[]): string[] {
  return stack.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);
}

export default function ProjectCard({ project }: { project: ProjectWithId }) {
  const id = project._id as string;
  const tags = parseTags(project.techStack);
  const visibleTags = tags.slice(0, 5);
  const extraCount = tags.length - visibleTags.length;

  return (
    <Link
      href={`/projects/${id}`}
      className="group flex flex-col bg-white border border-neutral-200 shadow-card transition-all duration-200 hover:border-neutral-900 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative h-[210px] bg-neutral-100 border-b border-neutral-200 overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500">
              No preview image
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 grow">

        {/* Meta: student name + topic badge */}
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 truncate">
            &gt; {project.studentName}
          </p>
          {project.topic && (
            <span className={`shrink-0 inline-flex items-center h-[20px] px-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] border ${topicBadge(project.topic)}`}>
              {project.topic}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-instrument-serif text-[1.65rem] leading-[1.05] text-neutral-900 group-hover:text-brand-600 transition-colors">
          {project.title}
        </h2>

        {/* Description */}
        <p className="font-sans text-[0.9rem] leading-snug text-neutral-600 italic line-clamp-2">
          {project.description}
        </p>

        {/* Tech tags */}
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <span key={tag}
                className="inline-flex items-center h-[22px] px-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] bg-brand-100 border border-brand-300 text-brand-800">
                {tag}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="inline-flex items-center h-[22px] px-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] border border-neutral-300 text-neutral-500">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500 group-hover:text-neutral-900 transition-colors">
              View project
            </span>
            {project.linkedinUrl && (
              <span
                onClick={(e) => { e.preventDefault(); window.open(project.linkedinUrl, '_blank', 'noopener,noreferrer'); }}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-sky-600 hover:text-sky-800 transition-colors"
              >
                LinkedIn
              </span>
            )}
          </div>
          <span aria-hidden className="font-mono text-sm text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
