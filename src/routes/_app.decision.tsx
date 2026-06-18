import { createFileRoute } from "@tanstack/react-router";
import { Heart, HeartCrack, Loader2, PartyPopper, Timer, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DECISION_QUESTION_ID, DECISION_REVEAL_AT } from "@/config";
import { useCastVote, useVotes } from "@/lib/store";

export const Route = createFileRoute("/_app/decision")({
  head: () => ({ meta: [{ title: "La Décision · Nous & Chill" }] }),
  component: DecisionPage,
});

const OUI = "Oui, on continue ❤️";
const NON = "Non, c'est fini 💔";

function useCountdown(targetIso: string) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, target - now);
  const reached = remaining <= 0;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return { reached, days, hours, minutes, seconds };
}

function CountdownBanner({ targetIso }: { targetIso: string }) {
  const { reached, days, hours, minutes, seconds } = useCountdown(targetIso);

  if (reached) return null;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/60 px-6 py-4 text-center">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
        <Timer className="w-3.5 h-3.5" />
        Résultats dimanche à 18h
      </div>
      <div className="flex items-baseline gap-3 tabular-nums">
        <TimeUnit value={days} label="j" />
        <TimeUnit value={hours} label="h" />
        <TimeUnit value={minutes} label="m" />
        <TimeUnit value={seconds} label="s" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-2xl sm:text-3xl font-black text-primary">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function DecisionPage() {
  const votesQuery = useVotes();
  const castVote = useCastVote();
  const [burstOption, setBurstOption] = useState<string | null>(null);
  const { reached: resultsRevealed } = useCountdown(DECISION_REVEAL_AT);

  if (votesQuery.isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const question = votesQuery.data?.find((q) => q.id === DECISION_QUESTION_ID);

  if (!question) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-muted-foreground text-sm">Le vote n'est pas encore ouvert.</p>
      </div>
    );
  }

  const voted = Boolean(question.my_choice);
  const ouiCount = question.results[OUI] ?? 0;
  const nonCount = question.results[NON] ?? 0;
  const total = question.total;
  const ouiPct = total ? Math.round((ouiCount / total) * 100) : 0;
  const nonPct = total ? Math.round((nonCount / total) * 100) : 0;
  const myChoice = question.my_choice;

  function handleVote(option: string) {
    if (voted || castVote.isPending) return;
    setBurstOption(option);
    castVote.mutate(
      { questionId: question!.id, option },
      {
        onSuccess: () => toast.success("Ton vote a été enregistré."),
        onError: () => {
          toast.error("Impossible de voter pour le moment.");
          setBurstOption(null);
        },
      },
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8 animate-float-in">
        <CountdownBanner targetIso={DECISION_REVEAL_AT} />

        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
            La grande question
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter">
            On continue l'aventure ?
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {voted
              ? "Ton vote est enregistré."
              : "Un seul vote par personne. Personne ne verra le tien."}
          </p>
        </div>

        {/* Vote buttons / thank you / results */}
        {!voted ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <VoteCard
              label="Oui, on continue"
              emoji="❤️"
              description="L'aventure n'est pas finie"
              color="yes"
              onClick={() => handleVote(OUI)}
              disabled={castVote.isPending}
              bursting={burstOption === OUI}
            />
            <VoteCard
              label="Non, c'est fini"
              emoji="💔"
              description="Le rideau tombe ici"
              color="no"
              onClick={() => handleVote(NON)}
              disabled={castVote.isPending}
              bursting={burstOption === NON}
            />
          </div>
        ) : resultsRevealed ? (
          <div className="space-y-4">
            <ResultBar
              label="Oui, on continue"
              emoji="❤️"
              count={ouiCount}
              pct={ouiPct}
              isChosen={myChoice === OUI}
              color="yes"
            />
            <ResultBar
              label="Non, c'est fini"
              emoji="💔"
              count={nonCount}
              pct={nonPct}
              isChosen={myChoice === NON}
              color="no"
            />
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{total} vote{total > 1 ? "s" : ""} au total</span>
            </div>
          </div>
        ) : (
          <ThankYouPanel choice={myChoice} />
        )}

        {/* Verdict */}
        {voted && resultsRevealed && total > 0 && (
          <div className="text-center animate-float-in">
            {ouiPct > nonPct ? (
              <p className="text-lg font-bold text-primary">
                Le public dit oui. <span className="text-foreground">La suite s'écrit.</span>
              </p>
            ) : ouiPct < nonPct ? (
              <p className="text-lg font-bold text-muted-foreground">
                Le public dit non. <span className="text-foreground">Chapitre final.</span>
              </p>
            ) : (
              <p className="text-lg font-bold text-accent">
                Égalité parfaite. <span className="text-foreground">Le destin hésite.</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThankYouPanel({ choice }: { choice: string | null }) {
  const isYes = choice === OUI;
  return (
    <div className="relative rounded-2xl border border-border bg-card p-10 text-center overflow-hidden animate-float-in">
      <div className="relative inline-flex items-center justify-center mb-4">
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-vote-ring" />
        <PartyPopper className="w-10 h-10 text-primary animate-vote-burst" />
      </div>
      <p className="text-xl font-black mb-1">Merci d'avoir voté !</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Ton choix ({isYes ? "Oui ❤️" : "Non 💔"}) est enregistré. Les résultats seront révélés
        dimanche à 18h, reviens à ce moment-là pour découvrir le verdict du public.
      </p>
      {!isYes && (
        <p className="text-sm font-bold text-muted-foreground mt-3">
          Ça nous fera une place en plus pour le mariage 😏
        </p>
      )}
    </div>
  );
}

function VoteCard({
  label,
  emoji,
  description,
  color,
  onClick,
  disabled,
  bursting,
}: {
  label: string;
  emoji: string;
  description: string;
  color: "yes" | "no";
  onClick: () => void;
  disabled: boolean;
  bursting: boolean;
}) {
  const isYes = color === "yes";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full rounded-2xl border p-8 sm:p-10 text-center transition-all duration-200 overflow-hidden ${
        isYes
          ? "border-primary/40 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_40px_oklch(0.58_0.22_27/0.3)]"
          : "border-border hover:border-muted-foreground hover:bg-secondary/50"
      } bg-card disabled:cursor-wait ${bursting ? "animate-vote-fade-out" : ""}`}
    >
      {bursting && (
        <span
          className={`absolute inset-0 rounded-2xl ${isYes ? "bg-primary/20" : "bg-secondary/40"} animate-vote-ring`}
        />
      )}
      <div
        className={`text-4xl mb-3 transition-transform group-hover:scale-110 ${bursting ? "animate-vote-burst" : ""}`}
      >
        {emoji}
      </div>
      <p className={`text-xl font-black mb-1 ${isYes ? "text-primary" : "text-foreground"}`}>
        {label}
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {isYes ? (
        <Heart className="absolute bottom-4 right-4 w-4 h-4 text-primary/30 group-hover:text-primary/60 transition-colors" />
      ) : (
        <HeartCrack className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
      )}
    </button>
  );
}

function ResultBar({
  label,
  emoji,
  count,
  pct,
  isChosen,
  color,
}: {
  label: string;
  emoji: string;
  count: number;
  pct: number;
  isChosen: boolean;
  color: "yes" | "no";
}) {
  const isYes = color === "yes";
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden p-5 transition-all ${
        isChosen
          ? isYes
            ? "border-primary bg-primary/10"
            : "border-muted-foreground bg-secondary/50"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 transition-all duration-700 ${
          isYes ? "bg-primary/20" : "bg-secondary/60"
        }`}
        style={{ width: `${pct}%` }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className={`font-bold ${isChosen ? (isYes ? "text-primary" : "text-foreground") : "text-foreground"}`}>
              {label}
            </p>
            {isChosen && (
              <p className="text-xs text-muted-foreground">Ton vote</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums">{pct}%</p>
          <p className="text-xs text-muted-foreground">{count} vote{count > 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
}
