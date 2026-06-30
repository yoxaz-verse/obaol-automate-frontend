import StatusBadge from "@/components/ui/StatusBadge";

export type TransactionMilestone = {
  id: string;
  label: string;
  status: string;
  responsibleParty?: string;
  nextAction?: string;
  blockedReason?: string;
  timestamp?: string;
  permittedActions?: string[];
};

export default function DetailTimeline({ milestones }: { milestones: TransactionMilestone[] }) {
  return (
    <ol aria-label="Transaction progress" className="space-y-3">
      {milestones.map((milestone) => (
        <li key={milestone.id} className="rounded-2xl border db-border-subtle db-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-foreground">{milestone.label}</h3><StatusBadge status={milestone.status} /></div>
          {milestone.responsibleParty && <p className="mt-2 text-sm db-muted"><strong className="text-foreground">Responsible:</strong> {milestone.responsibleParty}</p>}
          {milestone.nextAction && <p className="mt-1 text-sm db-muted"><strong className="text-foreground">Next action:</strong> {milestone.nextAction}</p>}
          {milestone.blockedReason && <p className="mt-2 rounded-xl bg-danger-500/10 p-3 text-sm text-danger-700 dark:text-danger-300"><strong>Blocked:</strong> {milestone.blockedReason}</p>}
          {milestone.timestamp && <time className="mt-2 block text-xs db-muted">{milestone.timestamp}</time>}
        </li>
      ))}
    </ol>
  );
}
