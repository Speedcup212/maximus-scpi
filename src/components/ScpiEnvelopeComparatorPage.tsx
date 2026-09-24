import React from 'react';
import ScpiEnvelopeComparator from './ScpiEnvelopeComparator';

const ScpiEnvelopeComparatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <ScpiEnvelopeComparator
        defaultAmount={100000}
        defaultYield={5}
        defaultDuration={15}
        onCtaClick={() => (window as any).openRdvModal?.()}
      />
    </div>
  );
};

export default ScpiEnvelopeComparatorPage;
