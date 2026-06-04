'use client';

import { useEffect, useState, useCallback } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { ProjectWithId } from '@/lib/types';
import { TOPICS, TOPIC_COLORS } from '@/lib/topics';

function SkeletonCard() {
  return (
    <div className="bg-white border border-neutral-200 shadow-card animate-pulse">
      <div className="h-[210px] bg-neutral-200 border-b border-neutral-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-2.5 w-28 bg-neutral-200" />
          <div className="h-[20px] w-20 bg-neutral-200" />
        </div>
        <div className="h-8 w-4/5 bg-neutral-200" />
        <div className="h-4 w-full bg-neutral-200" />
        <div className="h-4 w-2/3 bg-neutral-200" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-[22px] w-14 bg-neutral-200" />
          <div className="h-[22px] w-16 bg-neutral-200" />
          <div className="h-[22px] w-12 bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [projects, setProjects] = useState<ProjectWithId[]>([]);
  const [filtered, setFiltered] = useState<ProjectWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState('All');

  // topics that actually have submissions
  const [usedTopics, setUsedTopics] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data: ProjectWithId[] = await res.json();
      setProjects(data);
      const topicSet = new Set<string>();
      data.forEach((p) => { if (p.topic) topicSet.add(p.topic); });
      // preserve TOPICS order
      setUsedTopics(TOPICS.filter((t) => topicSet.has(t)));
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    let result = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (activeTopic !== 'All') {
      result = result.filter((p) => p.topic === activeTopic);
    }
    setFiltered(result);
  }, [projects, search, activeTopic]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-2">
          &gt; University of Oregon / CS322
        </p>
        <h1 className="font-instrument-serif text-5xl text-neutral-900 leading-tight mb-2">
          Project Gallery
        </h1>
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-superwide">
          {loading ? '' : `${projects.length} project${projects.length !== 1 ? 's' : ''} submitted`}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-4 pr-8 py-2.5 bg-white border border-neutral-200 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xl leading-none">
            &times;
          </button>
        )}
      </div>

      {/* Topic filter */}
      {usedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveTopic('All')}
            className={`inline-flex items-center h-[28px] px-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] border transition-colors ${
              activeTopic === 'All'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:text-neutral-900'
            }`}
          >
            All
          </button>
          {usedTopics.map((topic) => {
            const isActive = activeTopic === topic;
            const colors = TOPIC_COLORS[topic];
            return (
              <button
                key={topic}
                onClick={() => setActiveTopic(isActive ? 'All' : topic)}
                className={`inline-flex items-center h-[28px] px-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] border transition-colors ${
                  isActive
                    ? colors?.filter ?? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-500 mb-4">
            {search || activeTopic !== 'All' ? 'No results' : 'No projects yet'}
          </p>
          <p className="font-instrument-serif text-2xl text-neutral-700 mb-6">
            {search || activeTopic !== 'All'
              ? 'Try a different search or filter.'
              : 'Be the first to submit your project.'}
          </p>
          {!search && activeTopic === 'All' && (
            <a href="/submit"
              className="inline-block bg-brand-700 hover:bg-brand-600 text-white font-mono text-[10px] uppercase tracking-superwide px-6 py-3 transition-colors">
              Submit Project
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProjectCard key={p._id as string} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
