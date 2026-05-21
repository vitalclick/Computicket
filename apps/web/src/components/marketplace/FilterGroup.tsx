import { Icon } from '@/components/Icon';

interface Props {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}

export function FilterGroup({ title, children, last }: Props) {
  return (
    <div
      style={{
        paddingBottom: 20,
        marginBottom: 20,
        borderBottom: last ? 'none' : '1px solid var(--line)',
      }}
    >
      <div className="between mb-3">
        <span className="fw-600" style={{ fontSize: 13 }}>
          {title}
        </span>
        <Icon name="chevronDown" size={13} />
      </div>
      {children}
    </div>
  );
}
