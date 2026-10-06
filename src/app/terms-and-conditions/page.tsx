import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Tech Infinix',
  description: 'Terms and Conditions for using Tech Infinix services and applications.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: October 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing our website and using our services, you agree to be bound by these Terms and Conditions and agree that you are 
              responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited 
              from accessing this site and using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Tech Infinix's website 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on Tech Infinix's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p className="mt-4">
              This will let Tech Infinix to terminate upon violations of any of these restrictions. Upon termination, your viewing right 
              will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Third-Party Services and APIs</h2>
            <p>
              Our services integrate with certain third-party APIs, including Google APIs. By authenticating your Google account with 
              our application, you agree to allow us to perform specific actions on your behalf (such as sending emails) strictly 
              limited to the scopes you explicitly authorize. We comply with all third-party developer policies, including the Google 
              API Services User Data Policy, as detailed in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Limitations</h2>
            <p>
              Tech Infinix or its suppliers will not be hold accountable for any damages that will arise with the use or inability to 
              use the materials on Tech Infinix’s Website, even if Tech Infinix or an authorize representative of this Website has been 
              notified, orally or written, of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Revisions and Errata</h2>
            <p>
              The materials appearing on Tech Infinix’s Website may include technical, typographical, or photographic errors. Tech Infinix 
              will not promise that any of the materials in this Website are accurate, complete, or current. Tech Infinix may change the 
              materials contained on its Website at any time without notice. Tech Infinix does not make any commitment to update the materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Site Terms of Use Modifications</h2>
            <p>
              Tech Infinix may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are 
              agreeing to be bound by the current version of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding these Terms and Conditions, please contact us at: <strong>contact@techinfinix.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
