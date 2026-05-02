import type { LegalDocumentMeta, LegalDocId } from '../types'

/** Central legal copy — replace via CMS/API when wired. */
export const LEGAL_LAST_UPDATED = '2026-05-02'

const terms: LegalDocumentMeta = {
  id: 'terms',
  slug: 'terms',
  title: 'Terms & Conditions',
  shortTitle: 'Terms',
  description: 'Rules for using the G-com provider dashboard and related marketplace services.',
  lastUpdated: LEGAL_LAST_UPDATED,
  version: '1.0',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'These Terms & Conditions (“Terms”) govern your access to and use of the G-com provider dashboard, APIs, and related services (collectively, the “Services”). By registering or continuing to use the Services, you agree to these Terms on behalf of yourself and any business you represent.',
        'If you do not agree, you must not use the Services. We may update these Terms from time to time; the “Last updated” date at the top of this page reflects the latest version.',
      ],
    },
    {
      id: 'user-responsibilities',
      title: 'User responsibilities',
      paragraphs: [
        'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate registration information and keep it current.',
        'You must comply with applicable laws, only use the Services for lawful business purposes, and not interfere with or disrupt the integrity or performance of the Services or third-party data.',
      ],
      bullets: [
        'Notify us promptly of any unauthorized access or security incident.',
        'Use strong passwords and enable additional security controls when offered.',
        'Do not share dashboard access with parties that have not been authorized through controller permissions.',
      ],
    },
    {
      id: 'vendor-guidelines',
      title: 'Vendor guidelines',
      paragraphs: [
        'As a provider on G-com, you must represent your offerings honestly, fulfil orders and bookings according to your stated policies, and respond to customers within reasonable timeframes.',
        'Listings, pricing, and availability must be accurate. Misleading claims, prohibited goods or services, or abusive behaviour toward buyers or staff may result in restrictions or termination.',
      ],
      highlights: [
        {
          title: 'Quality bar',
          body: 'We may remove or restrict content that violates platform standards or creates undue risk to buyers.',
        },
      ],
    },
    {
      id: 'payment-terms',
      title: 'Payment terms',
      paragraphs: [
        'Fees, commissions, and payout schedules are described in your merchant agreement and in-product disclosures. You authorize us and our payment partners to process transactions, deduct applicable fees, and settle funds according to the timelines shown in your dashboard.',
        'You are responsible for taxes associated with your sales except where we are explicitly required to collect and remit on your behalf.',
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellation policy',
      paragraphs: [
        'Cancellation and refund rules for your buyers must be clearly stated in your shop or service settings and must comply with applicable consumer protection laws. Where G-com facilitates refunds, processing times may depend on payment rails and banking partners.',
      ],
    },
    {
      id: 'account-restrictions',
      title: 'Account restrictions',
      paragraphs: [
        'We may suspend or terminate access if we reasonably believe you have violated these Terms, created risk or harm, or are required to do so by law or payment partners. Where practical, we will provide notice and an opportunity to resolve issues before termination.',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual property',
      paragraphs: [
        'The Services, including software, branding, and documentation, are owned by G-com and its licensors. You retain ownership of your content; you grant us a license to host, display, and distribute that content as needed to operate the Services.',
        'You must not copy, modify, or reverse engineer the Services except as permitted by law.',
      ],
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, G-com and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or goodwill, arising from your use of the Services.',
        'Our aggregate liability for claims relating to the Services is limited to the greater of the fees you paid us in the three months preceding the claim or fifty dollars (USD), except where liability cannot be limited by law.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact information',
      paragraphs: [
        'For questions about these Terms, contact us through the in-dashboard Support channel or at the address provided in your merchant agreement. Please include your business name and registered email so we can respond efficiently.',
      ],
    },
  ],
}

const privacy: LegalDocumentMeta = {
  id: 'privacy',
  slug: 'privacy',
  title: 'Privacy Policy',
  shortTitle: 'Privacy',
  description: 'How we collect, use, and safeguard your account and business data.',
  lastUpdated: LEGAL_LAST_UPDATED,
  version: '1.0',
  sections: [
    {
      id: 'data-collection',
      title: 'Data collection',
      paragraphs: [
        'We collect information you provide when you register, complete your profile, list products or services, process orders, and communicate with buyers or support. This may include names, contact details, business identifiers, payout and tax information, and message content.',
        'We also collect technical data such as device type, browser, IP address, and usage logs to secure accounts and improve the Services.',
      ],
    },
    {
      id: 'information-usage',
      title: 'How we use information',
      paragraphs: [
        'We use data to operate and improve the dashboard, authenticate users, process payments and payouts, prevent fraud, comply with legal obligations, and communicate service-related notices.',
        'We may use aggregated or de-identified data for analytics and product development.',
      ],
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies & tracking',
      paragraphs: [
        'We use cookies and similar technologies to keep you signed in, remember preferences, measure performance, and protect against abuse. You can control cookies through browser settings; disabling some cookies may limit dashboard functionality.',
      ],
    },
    {
      id: 'payment-security',
      title: 'Payment security',
      paragraphs: [
        'Payment card and bank data are handled by PCI-aware processors. We do not store full card numbers on our servers. Access to financial settings is restricted and logged for fraud prevention.',
      ],
      highlights: [
        {
          title: 'Sensitive actions',
          body: 'Withdrawals and payout changes may require re-authentication or email verification.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third-party services',
      paragraphs: [
        'We integrate with payment, messaging, infrastructure, and analytics providers. Their processing is governed by their policies and our data processing agreements where applicable. We only share what is needed to deliver the Services.',
      ],
    },
    {
      id: 'user-rights',
      title: 'Your rights',
      paragraphs: [
        'Depending on your region, you may have rights to access, correct, delete, or export personal data, and to object to or restrict certain processing. Submit requests via Support; we will respond within applicable timelines.',
      ],
    },
    {
      id: 'retention',
      title: 'Data retention',
      paragraphs: [
        'We retain data as long as your account is active or as needed to provide the Services, comply with law, resolve disputes, and enforce agreements. Backup copies may persist for a limited period after deletion.',
      ],
    },
    {
      id: 'security-measures',
      title: 'Security measures',
      paragraphs: [
        'We implement administrative, technical, and organizational measures designed to protect data, including encryption in transit, access controls, monitoring, and employee training. No system is perfectly secure; please report suspected incidents promptly.',
      ],
    },
    {
      id: 'privacy-contact',
      title: 'Contact',
      paragraphs: [
        'For privacy-related requests, use the Support page in your dashboard or contact your account representative if one has been assigned.',
      ],
    },
  ],
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocumentMeta> = {
  terms,
  privacy,
}

export const LEGAL_DOC_ORDER: LegalDocId[] = ['terms', 'privacy']

export function getLegalDocument(slug: string): LegalDocumentMeta | undefined {
  const entry = Object.values(LEGAL_DOCUMENTS).find((d) => d.slug === slug)
  return entry
}
