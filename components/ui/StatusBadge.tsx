interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; color: string; border?: string }> = {
  available:   { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.30)' },
  locked:      { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' },
  sold:        { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.30)' },
  confirmed:   { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  pending:     { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  cancelled:   { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  refunded:    { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  draft:       { bg: 'rgba(113,113,122,0.15)', color: '#71717A' },
  on_sale:     { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6' },
  sold_out:    { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  published:   { bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
  completed:   { bg: 'rgba(113,113,122,0.15)', color: '#71717A' },
  valid:       { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  used:        { bg: 'rgba(113,113,122,0.15)', color: '#71717A' },
  fan:         { bg: 'rgba(113,113,122,0.15)', color: '#A1A1AA' },
  organizer:   { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6' },
  platform_admin: { bg: 'rgba(6,182,212,0.15)', color: '#06B6D4' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] ?? statusStyles.draft;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      ...style,
    }}>
      {label}
    </span>
  );
}
