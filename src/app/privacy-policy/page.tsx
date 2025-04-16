import React from 'react';

export const metadata = {
  title: 'Privacy Policy | LUSH MILK',
  description: 'LUSH MILK app privacy policy and data processing information',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to LUSH MILK. We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you about how we look after your personal data when you visit our website
          and tell you about your privacy rights and how the law protects you.
        </p>
        <p>
          This privacy policy applies to all users of the LUSH MILK application and website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
        <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes payment card details (stored securely through our payment processor).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
        <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>To register you as a new customer</li>
          <li>To process and deliver your order</li>
          <li>To manage our relationship with you</li>
          <li>To improve our website, products/services, marketing or customer relationships</li>
          <li>To recommend products or services that may be of interest to you</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used
          or accessed in an unauthorized way, altered or disclosed. These include:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>End-to-end encryption for sensitive data</li>
          <li>Secure authentication systems</li>
          <li>Regular security audits</li>
          <li>Strict access controls for our staff</li>
          <li>Regular testing of our security systems</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Legal Rights</h2>
        <p className="mb-4">Under data protection laws, you have rights including:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Right to access</strong> - You can request copies of your personal data.</li>
          <li><strong>Right to rectification</strong> - You can request correction of your personal data.</li>
          <li><strong>Right to erasure</strong> - You can request that we delete your personal data.</li>
          <li><strong>Right to restrict processing</strong> - You can request we temporarily or permanently stop processing your personal data.</li>
          <li><strong>Right to data portability</strong> - You can request transfer of your data to you or a third party.</li>
          <li><strong>Right to object</strong> - You can object to processing of your personal data.</li>
        </ul>
        <p>
          If you wish to exercise any of these rights, please contact us at privacy@lushmilk.in.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our website and hold certain information.
          Cookies are files with small amount of data which may include an anonymous unique identifier.
        </p>
        <p>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
          and updating the "Last Updated" date at the top of this Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <p>Email: privacy@lushmilk.in</p>
        <p>Address: 123 Dairy Lane, Milk City, MC 12345</p>
      </section>
    </div>
  );
} 