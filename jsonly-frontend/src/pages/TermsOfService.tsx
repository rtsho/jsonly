import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TermsOfService: React.FC = () => {
  const markdownContent = `
# JSONly Terms of Service
Last Updated: June 21, 2025

Welcome to JSONly! These Terms of Service ("Terms") govern your use of JSONly ("we", "us", "our")—a service that allows you to convert uploaded PDF documents into structured JSON data. Please read these Terms carefully. By using JSONly, you agree to be bound by these Terms.

If you're using JSONly on behalf of an organization, you're accepting these Terms on behalf of that organization.

## 1. Your Files
You retain all rights and ownership of the files you upload. JSONly uses your files solely to process and return structured data. We do not store your uploaded PDFs, and your files are deleted automatically after processing.

We do not share your files with any third party unless required by law. JSONly employees do not access your files except as strictly necessary to ensure proper function or investigate technical issues, and access is logged.

## 2. Your Responsibilities
By using JSONly, you agree to:

- Only upload content you have the legal right to use.
- Comply with all applicable laws and regulations.
- Not use JSONly to upload or process material that is illegal, abusive, or violates the rights of others.
- Keep your account credentials secure if applicable.

You are solely responsible for the legality and accuracy of the content you upload and any data derived from it. You must not use JSONly for any unlawful purpose or to infringe on the rights of others.

## 3. Intellectual Property
The JSONly platform, including software, design, and branding, is protected by copyright, trademark, and other laws. You are granted a limited, non-exclusive, non-transferable license to use JSONly solely as permitted by these Terms.

You may not copy, modify, distribute, sell, or lease any part of our services without written permission.

## 4. Prohibited Uses
You agree not to:

- Upload malicious files (e.g., malware, spyware).
- Interfere with or disrupt the JSONly service.
- Attempt to access the service in unauthorized ways.
- Use automated tools to scrape or overload the system.
- Misrepresent your identity or affiliation.

## 5. Termination
We reserve the right to suspend or terminate your access if you violate these Terms, use the service unlawfully, or interfere with other users or the system. Upon termination, your access may be revoked, and any data processed but not yet retrieved may no longer be available.

## 6. Disclaimers
JSONly is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free, secure, or uninterrupted. We make no warranty regarding the accuracy or reliability of JSON data generated from your files.

## 7. Limitation of Liability
To the extent allowed by law, JSONly shall not be liable for:

- Indirect, incidental, or consequential damages.
- Loss of data, business, or profits.
- Unauthorized access to your content or data.

## 8. Privacy
We respect your privacy. We do not store uploaded PDFs, and your input data is processed temporarily in-memory unless otherwise specified. See our [Privacy Policy](/privacy) for more details.

## 9. Children
JSONly is not intended for users under 13 years of age. If we learn a user under 13 has created an account, we will delete it.

## 10. Modifications
We may update these Terms from time to time. We'll notify you of any material changes. Continued use of JSONly after changes implies acceptance of the revised Terms.

## 11. Contact
Have questions? Contact us at: support@jsonly.app
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

export default TermsOfService;