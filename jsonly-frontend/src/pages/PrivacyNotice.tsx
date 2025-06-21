import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PrivacyNotice: React.FC = () => {
  const markdownContent = `
# JSONly Privacy Notice
Last Updated: June 21, 2025

Your privacy matters to us. This Privacy Notice explains how JSONly ("we", "our", "us") collects, uses, and protects your personal information when you use our service.

## 1. Who We Are and What We Do
JSONly is a document processing tool that allows users to upload a PDF file and receive structured JSON data in return. We do not store uploaded files after processing, and we do not use your documents for training, marketing, or third-party sharing.

## 2. What We Collect
We collect two types of information:

### a) Your Uploaded Files
You upload PDF files to JSONly to convert them into JSON.

These files are processed in-memory and are not stored on our servers after processing.

We do not inspect, log, or share the contents of your files.

### b) Your Personal Information
We may collect:

- Email address and password (if you register for an account)
- Billing information (if you subscribe to a paid plan)
- Communication details (if you email us or fill out forms)
- Device info (browser type, IP address, usage timestamps)

We do not collect information from uploaded PDFs unless they are used in system logs for error tracking or debugging, in which case data is anonymized or minimized.

## 3. How We Use Your Information
We use your information to:

- Provide and operate the JSONly service
- Authenticate user logins and secure accounts
- Process payments
- Respond to your requests or support issues
- Improve system stability, performance, and usability
- Comply with legal obligations

We do not sell or trade your personal data to third parties.

## 4. File Privacy
Uploaded PDFs are processed in real time and automatically discarded after the response is generated. No content is stored, indexed, or reviewed unless explicitly authorized by you for support/debugging.

## 5. Cookies and Tracking
We use minimal cookies to:

- Keep you signed in
- Measure basic traffic (e.g., page visits)
- Improve website performance

You can block cookies in your browser settings, but the site may not function correctly.

## 6. Data Security
We use modern encryption (TLS) to protect data in transit. Account credentials are stored securely using hashed and salted passwords. Uploaded files are processed in memory or in secure, time-limited storage and are promptly deleted.

However, no method of digital transmission or storage is 100% secure.

## 7. Data Retention
- Uploaded files: Deleted immediately after processing
- Account information: Retained until you delete your account
- Billing records: Kept as required by law (e.g., tax compliance)

## 8. Your Rights
Depending on where you live (e.g., EU, UK, California), you may have rights to:

- Access, update, or delete your personal data
- Object to or restrict processing
- Request data portability
- Withdraw consent at any time

To exercise your rights, email: privacy@jsonly.app

## 9. Sharing of Information
We share your personal data only:

- With trusted providers for billing, authentication, or analytics (e.g., Stripe, Sentry)
- When required by law (e.g., legal subpoenas)
- If we're acquired or merged (with notice to you)

We never sell your data. We never share uploaded files.

## 10. Children
JSONly is not intended for children under 13. If we discover an account created by a child under 13, it will be deleted.

## 11. Changes to This Privacy Notice
We may update this notice to reflect legal or service changes. The date above reflects the latest revision. We'll notify you of material changes through the site or by email.

## 12. Contact Us
Questions or requests? Email: privacy@jsonly.app
`;

  return (
    <div className="prose dark:prose-invert max-w-none px-4 py-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="my-3" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({node, ...props}) => <li className="my-1" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default PrivacyNotice;