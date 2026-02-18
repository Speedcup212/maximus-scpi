import React from 'react';
import { FileText } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs text-slate-300">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
