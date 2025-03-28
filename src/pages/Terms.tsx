const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-3">
            By accessing and using BookRec, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by these terms, please do not use our services.
          </p>
          <p className="text-gray-600">
            These terms apply to all users, including without limitation users who are browsers, readers, authors, contributors, 
            and/or content creators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. User Account Responsibilities</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>You must be at least 13 years old to use BookRec.</li>
            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
            <li>You agree to accept responsibility for all activities that occur under your account.</li>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You agree to promptly update your account information to maintain its accuracy.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Privacy and Data Protection</h2>
          <div className="text-gray-600 space-y-3">
            <p>
              Our Privacy Policy explains how we collect, use, and protect your personal information. Key points include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We collect both personal and non-personal information to improve our services.</li>
              <li>Your data is stored securely using industry-standard encryption.</li>
              <li>We never sell your personal information to third parties.</li>
              <li>You can request a copy of your data or its deletion at any time.</li>
              <li>We use cookies and similar technologies to enhance your experience.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. User Content and Conduct</h2>
          <div className="text-gray-600 space-y-3">
            <p>When using BookRec, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post inappropriate, offensive, or illegal content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to access accounts or data belonging to others</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the service or servers</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Book Reviews and Ratings</h2>
          <div className="text-gray-600 space-y-3">
            <p>When submitting reviews and ratings, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your reviews must be based on your genuine experience with the book</li>
              <li>You will not post fake or misleading reviews</li>
              <li>You will not use reviews to promote or advertise other products</li>
              <li>BookRec reserves the right to remove reviews that violate these terms</li>
              <li>You grant BookRec a perpetual license to display your reviews</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Intellectual Property Rights</h2>
          <div className="text-gray-600 space-y-3">
            <p>
              The BookRec platform, including its logo, design, software, and content (excluding user-generated content), 
              is the property of BookRec and is protected by copyright and other intellectual property laws.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may not copy, modify, or distribute our content without permission</li>
              <li>You retain ownership of your user-generated content</li>
              <li>By posting content, you grant BookRec a license to use and display it</li>
              <li>We respect others' intellectual property and will respond to infringement notices</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Service Modifications and Termination</h2>
          <div className="text-gray-600 space-y-3">
            <p>BookRec reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or discontinue any part of the service without notice</li>
              <li>Terminate or suspend accounts for violations of these terms</li>
              <li>Remove content that violates these terms or is otherwise objectionable</li>
              <li>Update these terms with reasonable notice to users</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-600">
            BookRec provides its service on an "as is" and "as available" basis. We do not guarantee that:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
            <li>The service will be uninterrupted or error-free</li>
            <li>Book information will be completely accurate</li>
            <li>Any errors will be corrected</li>
          </ul>
          <p className="text-gray-600 mt-3">
            We are not liable for any indirect, incidental, special, consequential, or punitive damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
          <p className="text-gray-600">
            These terms shall be governed by and construed in accordance with the laws of the United States, 
            without regard to its conflict of law provisions. Any disputes arising under these terms will be 
            subject to the exclusive jurisdiction of the courts in the United States.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
          <p className="text-gray-600">
            For any questions about these Terms and Conditions, please contact us at{' '}
            <a href="mailto:BookRecHelp@Outlook.com" className="text-blue-500 hover:text-blue-600">
              BookRecHelp@Outlook.com
            </a>
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Last updated: March 28, 2025
        </p>
      </div>
    </div>
  );
};

export default Terms;
