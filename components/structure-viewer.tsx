'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { project } from '@/lib/projectData';
type NglModule = typeof import('ngl');
type Stage = InstanceType<NglModule['Stage']>;
type MolecularComponent = {
  addRepresentation: (
    type: string,
    params: Record<string, unknown>,
  ) => { dispose: () => void };
  autoView: (selection?: string, duration?: number) => void;
};
export function StructureViewer({ compact = false }: { compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null),
    stageRef = useRef<Stage | null>(null),
    compRef = useRef<MolecularComponent | null>(null),
    highlightRef = useRef<{ dispose: () => void } | null>(null),
    labelRef = useRef<{ dispose: () => void } | null>(null);
  const [structure, setStructure] = useState('9RUB'),
    [selected, setSelected] = useState('Overview'),
    [state, setState] = useState<'loading' | 'ready' | 'error'>('loading'),
    [spinning, setSpinning] = useState(false),
    [retry, setRetry] = useState(0),
    [activated, setActivated] = useState(compact);
  const residue = project.residues.find((r) => r.id === selected) ?? {
    kind: 'Experimental reference',
    title: 'A reference, not a result.',
    description:
      'Explore the deposited wild-type dimer. Select a residue to highlight its local environment and inspect the hypothesis it informed.',
  };
  useEffect(() => {
    if (activated || !host.current) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setActivated(true);
          io.disconnect();
        }
      },
      { rootMargin: '250px' },
    );
    io.observe(host.current);
    return () => io.disconnect();
  }, [activated]);
  useEffect(() => {
    if (!activated || !host.current) return;
    let disposed = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    let stage: Stage | undefined;
    let resize: ResizeObserver | undefined;
    setState('loading');
    setSpinning(false);
    setSelected('Overview');
    async function init() {
      try {
        const [NGL, response] = await Promise.all([
          import('ngl'),
          fetch(`/structures/${structure}.pdb`, { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error('Structure unavailable');
        const blob = await response.blob();
        if (disposed) return;
        stage = new NGL.Stage(host.current!, {
          backgroundColor: compact ? '#f8fbf7' : '#fafcf9',
          quality: 'medium',
          cameraType: 'orthographic',
          sampleLevel: 0,
        });
        stageRef.current = stage;
        const loaded = await stage.loadFile(blob, { ext: 'pdb' });
        if (disposed || !loaded) return;
        const comp = loaded as unknown as MolecularComponent;
        compRef.current = comp;
        comp.addRepresentation('cartoon', {
          sele: 'protein and :A',
          color: '#CBF6C1',
          quality: 'medium',
          aspectRatio: 4,
          scale: 1,
        });
        comp.addRepresentation('cartoon', {
          sele: 'protein and :B',
          color: '#83ac91',
          quality: 'medium',
          aspectRatio: 4,
          scale: 1,
        });
        comp.addRepresentation('ball+stick', {
          sele: '[RUB]',
          colorScheme: 'element',
          scale: 1.3,
          aspectRatio: 1.8,
        });
        comp.addRepresentation('spacefill', {
          sele: '[MG]',
          color: '#8668b5',
          scale: 0.65,
        });
        comp.autoView('protein', 0);
        stage.mouseControls.remove('scroll');
        resize = new ResizeObserver(() => stage?.handleResize());
        resize.observe(host.current!);
        stage.handleResize();
        setState('ready');
      } catch {
        if (!disposed) setState('error');
      } finally {
        clearTimeout(timeout);
      }
    }
    init();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
      resize?.disconnect();
      stage?.dispose();
      stageRef.current = null;
      compRef.current = null;
      highlightRef.current = null;
      labelRef.current = null;
    };
  }, [structure, retry, compact, activated]);
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) {
        stageRef.current?.setSpin(false);
        setSpinning(false);
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, []);
  function focus(id: string) {
    setSelected(id);
    const r = project.residues.find((x) => x.id === id)!;
    const comp = compRef.current;
    if (!comp) return;
    highlightRef.current?.dispose();
    labelRef.current?.dispose();
    const selection =
      structure === '5RUB' && id === 'K191' ? '191:A' : r.selection;
    highlightRef.current = comp.addRepresentation(
      id === 'Loops' ? 'cartoon' : 'ball+stick',
      { sele: selection, color: '#c08038', scale: 1.5 },
    );
    if (id !== 'Loops')
      labelRef.current = comp.addRepresentation('label', {
        sele: selection,
        labelType: 'res',
        color: '#23482d',
        zOffset: 2,
        labelGrouping: 'residue',
        showBorder: true,
        borderColor: '#ffffff',
        scale: 1.8,
      });
    comp.autoView(
      `(${selection}) or ([RUB] and :A)`,
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650,
    );
  }
  function reset() {
    setSelected('Overview');
    highlightRef.current?.dispose();
    labelRef.current?.dispose();
    highlightRef.current = null;
    labelRef.current = null;
    compRef.current?.autoView('protein', 0);
    setSpinning(false);
    stageRef.current?.setSpin(false);
  }
  return (
    <div className={compact ? 'molecule compact-molecule' : 'molecule'}>
      {!compact && (
        <div className="viewer-top">
          <div>
            <span className="eyebrow">Structure explorer</span>
            <h3>Inspect the molecular hypothesis.</h3>
          </div>
          <Tabs
            value={structure}
            onValueChange={(v) => setStructure(String(v))}
          >
            <TabsList aria-label="Select experimental structure">
              <TabsTrigger value="9RUB">9RUB · Bound</TabsTrigger>
              <TabsTrigger value="5RUB">5RUB · Apo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      <div className="viewer-layout">
        <div className="viewer-scene">
          <div
            className="ngl-host"
            ref={host}
            role="img"
            aria-label={`${structure} experimental RuBisCO dimer. Drag to rotate; use the labeled buttons to zoom or focus residues.`}
          />
          {state !== 'ready' && (
            <div className="viewer-fallback">
              <img
                src={compact ? '/Cover.webp' : '/I164-S368-interaction.webp'}
                alt="Project-supplied static RuBisCO rendering; interactive structure has not loaded"
              />
              <p role="status">
                {state === 'error'
                  ? '3D unavailable on this device. Static reference shown.'
                  : activated
                    ? 'Loading the experimental structure…'
                    : 'Static reference · 3D loads when in view'}
              </p>
              {state === 'error' && (
                <Button
                  variant="outline"
                  onClick={() => setRetry((x) => x + 1)}
                >
                  Retry 3D
                </Button>
              )}
            </div>
          )}
          <span className="structure-id">
            PDB {structure} <span>· Wild-type reference</span>
          </span>
          <div className="viewer-controls">
            <Button
              variant="outline"
              aria-label="Reset structure view"
              disabled={state !== 'ready'}
              onClick={reset}
            >
              <RotateCcw size={17} />
            </Button>
            <Button
              variant="outline"
              aria-label="Zoom in"
              disabled={state !== 'ready'}
              onClick={() => stageRef.current?.viewerControls.zoom(0.18)}
            >
              <ZoomIn size={17} />
            </Button>
            <Button
              variant="outline"
              aria-label="Zoom out"
              disabled={state !== 'ready'}
              onClick={() => stageRef.current?.viewerControls.zoom(-0.22)}
            >
              <ZoomOut size={17} />
            </Button>
            <Button
              variant="outline"
              aria-label={spinning ? 'Pause rotation' : 'Start slow rotation'}
              aria-pressed={spinning}
              disabled={state !== 'ready'}
              onClick={() => {
                stageRef.current?.setSpin(!spinning);
                setSpinning(!spinning);
              }}
            >
              {spinning ? <Pause size={17} /> : <Play size={17} />}
            </Button>
            {compact && (
              <a
                href="/projects/hubisco/#structure"
                className="viewer-open"
                aria-label="Open full structure explorer"
              >
                <Maximize2 size={17} />
              </a>
            )}
          </div>
          <span className="drag-hint">Drag to rotate · Buttons to zoom</span>
        </div>
        {!compact && (
          <aside className="residue-panel">
            <p className="eyebrow">Explore chain A</p>
            <div className="residue-buttons">
              {project.residues.map((r) => (
                <Button
                  key={r.id}
                  variant="outline"
                  aria-pressed={selected === r.id}
                  disabled={
                    state !== 'ready' ||
                    (structure === '5RUB' &&
                      (r.id === 'Mg²⁺' || r.id === 'Loops'))
                  }
                  onClick={() => focus(r.id)}
                >
                  {r.id}
                </Button>
              ))}
            </div>
            <div className="residue-explanation" aria-live="polite">
              <span className="pill">{residue.kind}</span>
              <h3>{residue.title}</h3>
              <p>{residue.description}</p>
            </div>
            <div className="viewer-legend">
              <span>
                <i className="key chain-a" />
                Chain A
              </span>
              <span>
                <i className="key chain-b" />
                Chain B
              </span>
              <span>
                <i className="key metal" />
                Mg²⁺
              </span>
            </div>
            <p className="small muted">
              {structure === '9RUB'
                ? 'Bound ligand: native RuBP, not HuBP. Carbamylated Lys191 includes linked FMT records.'
                : 'Nonactivated reference. No bound RuBP or Mg²⁺; substantial active-site loop regions are missing from the deposited coordinates.'}
            </p>
            <a
              className="text-link"
              href={`https://www.rcsb.org/structure/${structure}`}
              target="_blank"
              rel="noreferrer"
            >
              View deposited structure ↗
            </a>
          </aside>
        )}
      </div>
      {!compact && (
        <p className="viewer-footnote">
          Experimental reference structures support hypothesis generation. This
          is not a solved structure of an engineered HuBisCO mutant.{' '}
          <a href={`/structures/${structure}.pdb`} download>
            Download {structure} PDB ↓
          </a>
        </p>
      )}
    </div>
  );
}
