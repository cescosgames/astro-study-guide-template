import { useState } from 'preact/hooks';
import { generatePortMatchRound, type PortMatchRound } from '../../../lib/networking';
import { addXp } from '../../../lib/xp';

export interface PortMatchProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

type Selection = { side: 'port' | 'service'; id: string } | null;

export default function PortMatch({ difficulty }: PortMatchProps) {
  const [round, setRound] = useState<PortMatchRound>(() => generatePortMatchRound(difficulty));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Selection>(null);
  const [wrongPair, setWrongPair] = useState<{ port: string; service: string } | null>(null);
  const [hint, setHint] = useState<{ port: string; purpose: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const accuracy = attempts === 0 ? null : Math.round((correctAttempts / attempts) * 100);
  const complete = matched.size === round.ports.length;

  function pick(side: 'port' | 'service', id: string) {
    if (matched.has(id) && side === 'port') return;
    if (wrongPair || complete) return;

    if (!selected) {
      setSelected({ side, id });
      return;
    }

    if (selected.side === side) {
      // switch selection within the same column
      setSelected({ side, id });
      return;
    }

    const portId = side === 'port' ? id : selected.id;
    const serviceId = side === 'service' ? id : selected.id;
    const isCorrect = round.answerKey[portId] === serviceId;

    setAttempts((a) => a + 1);
    if (isCorrect) {
      setCorrectAttempts((c) => c + 1);
      setStreak((s) => s + 1);
      addXp(8);
      setMatched((m) => new Set(m).add(portId));
      setSelected(null);
      setHint({ port: portId, purpose: round.purposes[portId] });
    } else {
      setStreak(0);
      setWrongPair({ port: portId, service: serviceId });
      setSelected(null);
      setTimeout(() => setWrongPair(null), 500);
    }
  }

  function nextRound() {
    setRound(generatePortMatchRound(difficulty));
    setMatched(new Set());
    setSelected(null);
    setWrongPair(null);
    setHint(null);
  }

  function tileClass(side: 'port' | 'service', id: string) {
    const isMatched = matched.has(id);
    const isSelected = selected?.side === side && selected.id === id;
    const isWrong = side === 'port' ? wrongPair?.port === id : wrongPair?.service === id;

    if (isMatched) return 'btn-duo border-success bg-success/10 text-success opacity-60';
    if (isWrong) return 'btn-duo border-danger bg-danger/10 text-danger animate-shake';
    if (isSelected) return 'btn-duo btn-duo-primary';
    return 'btn-duo btn-duo-outline';
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="flex gap-2">
        <span class="font-display flex-1 rounded-2xl bg-gold/15 px-4 py-2 text-center text-sm font-bold text-gold-shade dark:text-gold">
          Streak: {streak}
        </span>
        <span class="font-display flex-1 rounded-2xl bg-accent/15 px-4 py-2 text-center text-sm font-bold text-accent">
          Accuracy: {accuracy === null ? '—' : `${accuracy}%`}
        </span>
      </div>

      <div class="flex flex-col gap-4 rounded-2xl border-2 border-border bg-surface-raised p-5 shadow-sm sm:p-6">
        <p class="text-center text-sm text-slate-500 dark:text-slate-400">
          Tap a port, then tap the service it belongs to.
        </p>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            {round.ports.map((tile) => (
              <button
                key={`port-${tile.id}`}
                type="button"
                disabled={matched.has(tile.id)}
                onClick={() => pick('port', tile.id)}
                class={`min-h-11 rounded-2xl px-3 font-mono text-sm font-bold ${tileClass('port', tile.id)}`}
              >
                {tile.label}
              </button>
            ))}
          </div>
          <div class="flex flex-col gap-2">
            {round.services.map((tile) => {
              const isMatchedService = matched.has(tile.id);
              return (
                <button
                  key={`service-${tile.id}`}
                  type="button"
                  disabled={isMatchedService}
                  onClick={() => pick('service', tile.id)}
                  class={`min-h-11 rounded-2xl px-3 text-left text-xs leading-tight sm:text-sm ${tileClass('service', tile.id)}`}
                >
                  {tile.label}
                </button>
              );
            })}
          </div>
        </div>

        {hint && !complete && (
          <p class="animate-pop rounded-xl bg-accent/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-200">
            💡 <span class="font-display font-bold text-accent">{hint.port}</span> — {hint.purpose}
          </p>
        )}

        {complete && (
          <>
            <p class="animate-pop font-display font-bold text-success">Round complete!</p>
            <button
              type="button"
              onClick={nextRound}
              class="btn-duo btn-duo-primary min-h-11 self-end rounded-2xl px-6"
            >
              Next Round →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
