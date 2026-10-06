import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tech Infinix',
  description: 'Privacy Policy for Tech Infinix services and applications.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: October 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Tech Infinix. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
            <p>
              We may collect personal identification information from Users in a variety of ways, including, but not limited to, 
              when Users visit our site, fill out a form, and in connection with other activities, services, features, or resources 
              we make available on our Site. Users may be asked for, as appropriate, name, email address, mailing address, and phone number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Google User Data and OAuth</h2>
            <p>
              Tech Infinix uses Google APIs and Google OAuth 2.0 authentication to provide certain automated functionalities, 
              specifically to send internal administrative alerts and notifications.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Data Requested:</strong> We request access to your email address and the ability to send emails on your behalf 
                (<code>https://www.googleapis.com/auth/gmail.send</code> and <code>https://www.googleapis.com/auth/userinfo.email</code>).
              </li>
              <li>
                <strong>Data Usage:</strong> This data is strictly used by our backend system to send automated system alerts, 
                contact form submissions, and notifications to our administrative team. We do <strong>not</strong> read your emails, 
                and we only send emails that are explicitly triggered by system events.
              </li>
              <li>
                <strong>Data Storage and Sharing:</strong> The authentication tokens (OAuth tokens) are securely stored in our backend server. 
                We do not share your Google user data with any third-party applications, external services, or advertisers.
              </li>
            </ul>
            <p className="mt-4">
              Our use and transfer to any other app of information received from Google APIs will adhere to the 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline mx-1">
                Google API Services User Data Policy
              </a>, 
              including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. How We Use Collected Information</h2>
            <p>Tech Infinix may collect and use Users' personal information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>To improve customer service:</strong> Information you provide helps us respond to your customer service requests and support needs more efficiently.</li>
              <li><strong>To send periodic emails:</strong> We may use the email address to respond to inquiries, questions, and/or other requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. How We Protect Your Information</h2>
            <p>
              We adopt appropriate data collection, storage, and processing practices and security measures to protect against 
              unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, 
              transaction information, and data stored on our Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Contacting Us</h2>
            <p>
              If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, 
              please contact us at: <strong>contact@techinfinix.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
