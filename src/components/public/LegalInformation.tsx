import React from 'react';

export const LegalInformation: React.FC = () => (
  <section id="privacy" className="bg-stone-100 border-t border-stone-200 py-10 text-sm text-stone-700">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Privacy Notice</h2>
        <p className="mt-2 leading-relaxed">
          This platform collects information submitted by a parent or authorised guardian, including student and contact details, only to route admission enquiries and provide school-management services to the selected branch. Data is shared with that branch and its authorised staff for those purposes.
        </p>
        <p className="mt-2 leading-relaxed">
          You may request access, correction, withdrawal of consent, or deletion where legally permitted by contacting the selected school branch. The platform does not use student information for advertising or unrelated profiling.
        </p>
      </div>
      <div id="terms">
        <h2 className="text-xl font-bold text-stone-900">Terms of Use</h2>
        <p className="mt-2 leading-relaxed">
          Branch administrators are responsible for the accuracy, lawful use, retention, and protection of records entered for their school. Access credentials must remain private and must not be shared. This service is provided for authorised school-management operations.
        </p>
      </div>
      <p className="text-xs text-stone-500">
        This notice is a product disclosure and should be reviewed and approved by the school organisation and qualified legal counsel before production use.
      </p>
    </div>
  </section>
);
