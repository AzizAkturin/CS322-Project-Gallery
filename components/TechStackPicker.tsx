'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';
import { TECH_STACK_CATEGORIES } from '@/lib/tech';

export default function TechStackPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState('');

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const tag = customInput.trim();
    if (!tag || selected.includes(tag)) {
      setCustomInput('');
      return;
    }
    onChange([...selected, tag]);
    setCustomInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
    if (e.key === ',') { e.preventDefault(); addCustom(); }
  }

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400 mb-1.5">Selected</p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 h-[24px] pl-2.5 pr-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] bg-neutral-900 text-white border border-neutral-900"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => toggle(tag)}
                  className="text-neutral-400 hover:text-white transition-colors w-4 h-4 flex items-center justify-center leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {TECH_STACK_CATEGORIES.map(({ category, options }) => (
        <div key={category}>
          <p className="font-mono text-[9px] uppercase tracking-superwide text-neutral-400 mb-1.5">{category}</p>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`h-[24px] px-2.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] border transition-colors ${
                  selected.includes(opt)
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom technology..."
          className="flex-1 px-3 py-1.5 border border-neutral-200 font-mono text-[0.75rem] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 border border-neutral-200 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
