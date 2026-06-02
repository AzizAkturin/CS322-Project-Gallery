export const TOPICS = [
  'AI & Machine Learning',
  'Healthcare',
  'Gaming',
  'Education',
  'Finance',
  'Productivity',
  'Social',
  'Environment',
  'Security',
  'Entertainment',
  'E-commerce',
  'Developer Tools',
  'Other',
] as const;

export type Topic = (typeof TOPICS)[number];

export const TOPIC_COLORS: Record<string, { badge: string; filter: string }> = {
  'AI & Machine Learning': {
    badge: 'bg-violet-100 border-violet-300 text-violet-800',
    filter: 'bg-violet-900 text-white border-violet-900',
  },
  'Healthcare': {
    badge: 'bg-rose-100 border-rose-300 text-rose-800',
    filter: 'bg-rose-700 text-white border-rose-700',
  },
  'Gaming': {
    badge: 'bg-amber-100 border-amber-300 text-amber-800',
    filter: 'bg-amber-700 text-white border-amber-700',
  },
  'Education': {
    badge: 'bg-sky-100 border-sky-300 text-sky-800',
    filter: 'bg-sky-700 text-white border-sky-700',
  },
  'Finance': {
    badge: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    filter: 'bg-emerald-700 text-white border-emerald-700',
  },
  'Productivity': {
    badge: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    filter: 'bg-indigo-700 text-white border-indigo-700',
  },
  'Social': {
    badge: 'bg-pink-100 border-pink-300 text-pink-800',
    filter: 'bg-pink-700 text-white border-pink-700',
  },
  'Environment': {
    badge: 'bg-green-100 border-green-300 text-green-800',
    filter: 'bg-green-700 text-white border-green-700',
  },
  'Security': {
    badge: 'bg-slate-100 border-slate-400 text-slate-800',
    filter: 'bg-slate-700 text-white border-slate-700',
  },
  'Entertainment': {
    badge: 'bg-orange-100 border-orange-300 text-orange-800',
    filter: 'bg-orange-700 text-white border-orange-700',
  },
  'E-commerce': {
    badge: 'bg-teal-100 border-teal-300 text-teal-800',
    filter: 'bg-teal-700 text-white border-teal-700',
  },
  'Developer Tools': {
    badge: 'bg-cyan-100 border-cyan-300 text-cyan-800',
    filter: 'bg-cyan-700 text-white border-cyan-700',
  },
  'Other': {
    badge: 'bg-neutral-100 border-neutral-300 text-neutral-700',
    filter: 'bg-neutral-700 text-white border-neutral-700',
  },
};

export function topicBadge(topic: string) {
  return TOPIC_COLORS[topic]?.badge ?? 'bg-neutral-100 border-neutral-300 text-neutral-700';
}
