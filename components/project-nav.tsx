'use client';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export const sections = [
  ['overview', 'Overview'],
  ['question', 'Question'],
  ['structure', 'Structural rationale'],
  ['strategy', 'Experimental strategy'],
  ['evidence', 'Evidence'],
  ['interpretation', 'Interpretation'],
  ['contribution', 'Contribution'],
  ['limitations', 'Limitations'],
  ['next-steps', 'Next steps'],
];
export function ProjectNav() {
  const [active, setActive] = useState('overview');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const denominator = document.documentElement.scrollHeight - innerHeight;
        setProgress(denominator > 0 ? Math.min(1, scrollY / denominator) : 0);
        const visible = sections.filter(
          ([id]) =>
            (document.getElementById(id)?.getBoundingClientRect().top ??
              Infinity) <= 180,
        );
        setActive(visible.at(-1)?.[0] ?? 'overview');
      });
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => {
      removeEventListener('scroll', update);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="project-nav">
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="wrap">
        <nav className="project-desktop-nav" aria-label="Case study sections">
          {sections.map(([id, title]) => (
            <a
              href={`#${id}`}
              key={id}
              aria-current={active === id ? 'location' : undefined}
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="project-mobile-nav">
          <span>In this case study</span>
          <Select
            value={active}
            onValueChange={(value) => {
              if (value) {
                setActive(value);
                document
                  .getElementById(value)
                  ?.scrollIntoView({
                    behavior: matchMedia('(prefers-reduced-motion: reduce)')
                      .matches
                      ? 'instant'
                      : 'smooth',
                  });
              }
            }}
          >
            <SelectTrigger aria-label="Jump to project section">
              <SelectValue>
                {sections.find((x) => x[0] === active)?.[1]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sections.map(([id, title]) => (
                <SelectItem key={id} value={id}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
