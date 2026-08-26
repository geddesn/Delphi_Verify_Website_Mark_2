# Delphi Verify Privacy Policy

**Last updated: 26 August 2026**

This Privacy Policy explains how Delphi Verify collects, uses, shares and protects personal data when you use our websites, mobile application, public verification pages and related services (the **Service**).

## 1. Who we are and our role

**Delphi Verify Inc.**, a Delaware corporation, is responsible for the processing described in this Policy where we decide why and how personal data is used. Our contact address is Corporation Service Company, 251 Little Falls Drive, Wilmington, Delaware 19808, United States. Privacy enquiries may be sent to [contact@delphiverify.com](mailto:contact@delphiverify.com).

Our role depends on the processing involved:

- we are a **controller** for account administration, operation and security of the Service, fraud prevention, support, website analytics and our legal obligations;
- where an organisation decides what evidence is captured, why it is captured, who may access it and how long it is retained, that organisation is generally the controller and we act as its **processor** under its instructions and the applicable data processing agreement; and
- where you use Delphi Verify independently, we are generally the controller for that use.

## 2. Personal data we process

Depending on how you use the Service, we process:

- **Account data:** user identifier, email address, name where provided, authentication provider and related Apple, Google or Firebase Authentication identifiers. Firebase Authentication processes credentials for email-and-password accounts; Delphi Verify does not store those passwords in its own application database.
- **Evidence and certificate data:** captured images and other submitted media, certificate title and description, capture and publication times, device-reported location and accuracy, selected location privacy level, hashes, cryptographic proof material and verification results.
- **Screening and integrity data:** application and device attestation, installation or device identifiers, security events, automated media-screening scores and reasons, and records required to verify certificate integrity.
- **Organisation data:** workspaces, invitations, roles and records configured by an organisation.
- **Technical data:** IP address, connection information, device type, operating system, application or browser version, diagnostic logs, error information and authentication or security events.
- **Communications and usage data:** support and contact messages, certificate reports, public-code activity and limited website interaction data where optional analytics is enabled.

Evidence may contain personal data about people who do not have a Delphi Verify account, including people, vehicle registrations, documents, addresses or possessions visible in a capture. This Policy applies to those individuals as well. The person or organisation commissioning the capture is responsible for ensuring that it has a lawful basis and any permission required to capture and publish that information.

With your permission, Delphi Verify accesses the camera to capture certificate images. It does not import images from your device photo library.

## 3. How and why we use personal data

We use personal data to:

- create and authenticate accounts and manage organisation access;
- capture, create, store, publish and verify evidence certificates;
- display the certificate content and location precision selected by the publisher;
- perform application, device, media-integrity and fraud-prevention checks;
- operate, secure, diagnose and improve the Service;
- provide support and send operational or invitation emails;
- provide optional analytics and embedded maps where consent has been given; and
- comply with law, enforce our agreements and protect rights, safety and security.

## 4. GDPR and UK GDPR lawful bases

Where the EU GDPR or UK GDPR applies and we act as controller, we rely on the following lawful bases:

| Purpose | Data | Lawful basis |
| --- | --- | --- |
| Providing accounts and the requested Service | Account, evidence, certificate and organisation data | Performance of a contract |
| Certificate verification and integrity | Evidence, certificate and integrity data | Performance of a contract; legitimate interests in reliable certificates |
| Security, fraud and misuse prevention | Integrity, technical and account data | Legitimate interests in protecting the Service and its users |
| Support and Service communications | Account and communications data | Performance of a contract; legitimate interests in responding to enquiries |
| Optional analytics, preferences and embedded maps | Limited usage, browser and preference data | Consent |
| Legal and regulatory obligations | Data required in the circumstances | Legal obligation |

Where we rely on legitimate interests, we consider the necessity and impact of the processing and the rights of affected individuals. You may object to this processing as explained in section 12. Where we rely on consent, you may withdraw it at any time; withdrawal does not affect processing already carried out lawfully.

Device permissions allow the application to access features such as the camera or location. You can withdraw them through your device settings, although functions that require them will then stop working. A device permission is not treated as consent under data protection law unless we expressly say so.

Where we act as processor, the customer controller determines and documents the applicable lawful basis.

## 5. Location privacy

Location provides geographic evidence for a certificate. With device permission, the application collects location and its reported accuracy at capture. The publisher selects an exact, nearby or broader-area disclosure level. For nearby or area disclosure, coordinates are reduced in precision before the certificate is created. This preserves the integrity protection applied to the disclosed location but changes what the certificate establishes: an area rather than an exact point.

The Service restricts location options where the available accuracy cannot support the selected level. A certificate workflow requiring geographic evidence cannot be completed without location permission.

## 6. Automated media screening

We use Google Cloud Vertex AI and Gemini services to analyse submitted media for indications of a recaptured or presented image, the presence of people, and visible private or identifying information. The screening returns probability scores and a short reason and may require a new capture or reject media before it becomes part of a certificate.

Automated screening is probabilistic and can be wrong. It is used to protect certificate integrity and reduce inappropriate or unauthorised publication; it is not intended to make decisions that produce legal or similarly significant effects about an individual. You may contact us to question a result. Delphi Verify does not use submitted media to train its own AI models.

Media detected as containing people, sensitive information or presentation-attack indicators is rejected and automatically deleted. It is not included in a certificate and is not used by Delphi Verify to train AI models.

## 7. Public certificates

Publishing a certificate is an explicit action. Before publication, the Service explains that the selected certificate information will be available to anyone with its QR code, public code or link. That person may open it without an account and may copy, download, record or forward what it shows. A public code is not access control.

Depending on the publisher's choices, a public certificate may display images, title, description, capture time, selected location precision, verification results and blockchain confirmation. It does not display the publisher's account email, internal user or organisation identifier, or internal storage path.

Do not publish personal or confidential information unless you are authorised to disclose it. If you are identifiable in a certificate published by someone else, you may exercise the rights described in section 12. Where an organisation controls the evidence, we may refer your request to that organisation and will tell you when we do.

## 8. Blockchain records

When an evidence record is sealed, a cryptographic commitment may be published to the Ethereum Attestation Service on Base mainnet. The blockchain record is designed not to contain readable photographs, location, timestamps, account information or other directly interpretable certificate data. It contains cryptographic commitments instead, but may nevertheless be capable of being related to information retained elsewhere and is not automatically anonymous.

Public blockchain records are permanent and outside our control. Deleting a certificate removes the media and certificate data held by Delphi Verify as described below, but cannot edit or erase an attestation already published on-chain.

## 9. When we share personal data

We do not sell personal data. We disclose it only as required to operate the Service or for the purposes described in this Policy, including to:

- **Google Cloud and Firebase:** authentication, databases, storage, hosting, backend processing, security and automated media screening;
- **Apple and Google:** sign-in and application or device-attestation services;
- **Google Maps and OpenStreetMap providers:** optional embedded maps;
- **Google:** reverse geocoding used to create location context;
- **PostHog:** consent-based website analytics;
- **Resend:** operational, invitation, contact and support emails;
- **Base, Ethereum Attestation Service and blockchain infrastructure providers:** public cryptographic integrity records; and
- professional advisers, regulators, courts, law enforcement or other recipients where required by law or reasonably necessary to protect rights, safety, security or the Service.

Service providers may process personal data only for the relevant service and subject to applicable contractual and legal obligations.

## 10. Cookies, analytics and maps

We use an essential first-party cookie named `delphi_cookie_consent` for up to 180 days to remember your privacy choices. With your consent, the first-party cookie `delphi-lang` may remember your language preference for up to 365 days. Firebase may use browser storage required to maintain authentication, and we may store display preferences.

Optional analytics is disabled until you consent. If enabled, our EU-hosted PostHog project receives page visits, named interactions and limited browser or device information. Automatic element capture, session replay, person profiles and automatic error capture are disabled, and public certificate codes are redacted from analytics URLs.

Google Maps and OpenStreetMap content is disabled until you consent. Enabling a map may send the certificate's disclosed coordinates, your IP address and standard request or device information to the relevant provider and may allow Google to use third-party cookies or similar technologies. The certificate location is not the current location of the viewer.

You can accept, reject or change optional choices at any time through **Cookie settings** in the website footer. Withdrawal stops future optional processing and does not affect processing already carried out lawfully.

## 11. International transfers and retention

Delphi Verify is established in the United States, and some providers process data outside the UK or European Economic Area. Certificate media in Firebase Storage is configured in `US-EAST1`; automated media screening is configured in Google Cloud's `us-central1` region. Other providers and their subprocessors may operate in additional countries.

Where the GDPR or UK GDPR requires, international transfers are covered by an adequacy decision or appropriate safeguards such as the European Commission's Standard Contractual Clauses, the UK International Data Transfer Agreement or UK Addendum, together with supplementary safeguards where required. You may contact us for information about the mechanism applicable to a transfer.

We retain personal data only for as long as required for the purpose for which it was collected, customer instructions, legal obligations, dispute resolution, security and fraud prevention:

- evidence and certificate data is retained until the certificate is deleted or for the period agreed with the organisation controlling it;
- account and organisation data is retained while the account or customer relationship remains active and then deleted or anonymised when no longer required;
- support, operational and security records are retained only for the period reasonably necessary for the enquiry, security purpose or legal obligation; and
- deletion and integrity audit records may be retained after the underlying evidence is removed to record that deletion occurred and preserve the reliability of the audit trail.

When deletion of a certificate is requested, public access is revoked immediately. The certificate is soft-deleted in the database for 30 days, with access restricted to authorised administrators. After that period, certificate media, GPS data, metadata, download tokens and associated active-system records are permanently deleted. Database backup and recovery data is retained for seven days. Firebase Storage keeps deleted media in a soft-deleted state for seven additional days before permanent deletion. A public blockchain record remains permanently as described in section 8.

Deleting an individual account does not delete evidence controlled by an organisation. Where deletion would conflict with a legal obligation or the integrity of a sealed record, we may instead restrict access, preserve the original and attach a correction, revocation or superseding record, as appropriate.

## 12. Your data protection rights

Where the GDPR or UK GDPR applies, you may have the right to:

- access your personal data and receive information about its processing;
- correct inaccurate or incomplete data;
- request erasure;
- restrict processing;
- receive data you provided in a portable format and, where technically feasible, have it transmitted to another controller;
- object to processing based on legitimate interests;
- withdraw consent at any time; and
- not be subject to a decision based solely on automated processing that produces legal or similarly significant effects, where that right applies.

These rights depend on the circumstances and lawful basis and may be subject to legal exceptions. To exercise them, email [contact@delphiverify.com](mailto:contact@delphiverify.com). We may need to verify your identity. Where the GDPR or UK GDPR applies, we aim to respond without undue delay and within one month, subject to any extension permitted by law.

You may complain at any time to the data protection authority where you live or work, or where you believe an infringement occurred. In Portugal, this is the **Comissão Nacional de Proteção de Dados (CNPD)**; in the United Kingdom, it is the **Information Commissioner's Office (ICO)**. We would appreciate the opportunity to address your concern first, but you are not required to contact us before complaining.

## 13. Security

We use technical and organisational safeguards appropriate to the nature and risk of the processing, including authentication, access controls, encryption in transit, restricted storage access, security monitoring and cryptographic integrity controls. No system is completely secure, and we cannot guarantee absolute security.

## 14. Children

The Service is not directed to children. If we learn that personal data was collected from a child contrary to applicable law, we will take appropriate steps to delete or restrict it.

## 15. Changes to this Policy

We may update this Policy as the Service or legal requirements change. We will revise the date above and, where a change is material, notify affected users through the Service, website or email as appropriate.

## 16. Contact

Privacy questions, rights requests and complaints may be sent to:

**Delphi Verify Inc.**  
Corporation Service Company  
251 Little Falls Drive  
Wilmington, Delaware 19808  
United States  
[contact@delphiverify.com](mailto:contact@delphiverify.com)
