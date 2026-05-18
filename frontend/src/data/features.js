export const FEATURES_DATA = [
  {
    id: 'multi-organization-system',
    iconName: 'Building2',
    title: 'Multi-Organization System',
    description: 'Manage complaints across colleges, hospitals, offices, and societies — all from a single platform with tenant isolation.',
    longDescription: 'CaseBridge introduces a true multi-tenant architecture. Super Admins can oversee multiple entities, while Org Admins only see data relevant to their specific organization. This ensures complete data privacy and isolation while allowing centralized management and scalability without deploying separate instances.',
    useCases: [
      'A university tracking maintenance requests across different campuses.',
      'A hospital managing patient feedback and facility issues.',
      'A corporate office handling IT support tickets.'
    ],
    benefits: [
      'Strict data isolation between organizations.',
      'Centralized oversight for super administrators.',
      'Customizable settings and roles per tenant.'
    ],
    demoType: 'visual-hierarchy'
  },
  {
    id: 'real-time-tracking',
    iconName: 'BarChart3',
    title: 'Real-time Tracking',
    description: 'Live status updates, instant notifications, and WebSocket-powered dashboards so nothing falls through the cracks.',
    longDescription: 'Every complaint is tracked in real-time. The moment a staff member updates a status or adds a comment, the original user and assigned admins see the changes instantly. No need to refresh the page. This eliminates communication gaps and drastically reduces resolution times.',
    useCases: [
      'A student instantly sees when a technician is dispatched to fix a broken AC.',
      'An admin watches a live dashboard of incoming high-priority complaints.',
    ],
    benefits: [
      'Zero delay in communication.',
      'Higher user satisfaction due to transparent progress.',
      'Reduced duplicate complaints.'
    ],
    demoType: 'real-time-dashboard'
  },
  {
    id: 'role-based-dashboards',
    iconName: 'ShieldCheck',
    title: 'Role-Based Dashboards',
    description: 'Tailored experiences for Super Admins, Org Admins, Staff, and Users with granular access control.',
    longDescription: 'Not all users need the same tools. CaseBridge provides tailored interfaces depending on your role. Users get a simple submission and tracking interface. Staff get specialized assignment queues. Admins get comprehensive oversight and management suites.',
    useCases: [
      'Staff members logging in to see only the complaints assigned directly to them.',
      'Users checking the status of their personal submissions without seeing others.'
    ],
    benefits: [
      'Reduced cognitive load with tailored interfaces.',
      'Enhanced security through Principle of Least Privilege.',
      'Faster onboarding for new staff members.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'ai-chatbot-assistant',
    iconName: 'Bot',
    title: 'AI Chatbot Assistant',
    description: 'Smart assistant that guides users through the complaint process, answers FAQs, and provides instant suggestions.',
    longDescription: 'The CaseBridge AI Assistant acts as a first line of support. It can help users categorize their complaints, answer common policy questions based on the organization\'s knowledge base, and even suggest immediate self-help solutions before a ticket is officially filed.',
    useCases: [
      'A resident asks how to reset their router before submitting an IT ticket.',
      'A user is guided step-by-step to fill out a complex grievance form.'
    ],
    benefits: [
      '24/7 immediate assistance for end-users.',
      'Reduces the load on staff by resolving trivial issues automatically.',
      'Consistent and polite communication.'
    ],
    demoType: 'ai-chat-simulator'
  },
  {
    id: 'video-meeting-support',
    iconName: 'Video',
    title: 'Video Meeting Support',
    description: 'Built-in video conferencing for Admin-to-Organization meetings. Generate meeting IDs, host, and join directly.',
    longDescription: 'Complex complaints sometimes require face-to-face resolution. CaseBridge integrates video meeting capabilities directly into the workflow. Generate meeting links, schedule syncs, and resolve escalated issues without ever leaving the platform.',
    useCases: [
      'An HR representative scheduling a video call to discuss a sensitive grievance.',
      'IT staff launching a screen-share session to debug a user issue remotely.'
    ],
    benefits: [
      'No need to switch between external apps like Zoom or Teams.',
      'Meeting context is permanently tied to the complaint ID.',
      'Encrypted and secure video streams.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'smart-notifications',
    iconName: 'Bell',
    title: 'Smart Notifications',
    description: 'Context-aware alerts via in-app notifications and email. Never miss a status update or assignment change.',
    longDescription: 'Stay informed without being overwhelmed. CaseBridge uses an intelligent notification engine to alert you only when necessary. Configure your preferences to receive push notifications, in-app alerts, or daily email digests regarding your assignments and complaints.',
    useCases: [
      'A user receiving an email when their complaint moves from "In Progress" to "Resolved".',
      'Staff getting an instant ping when a high-priority issue is assigned to them.'
    ],
    benefits: [
      'Highly customizable alert preferences.',
      'Ensures critical updates are never missed.',
      'Reduces email fatigue through batching.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'complaint-chat',
    iconName: 'MessageCircle',
    title: 'Complaint Chat',
    description: 'Real-time chat threads on every complaint. Discuss, attach files, and collaborate directly with assigned staff.',
    longDescription: 'Replace endless email chains with contextual chat. Every complaint features a dedicated chat thread where the reporter and the assigned staff can communicate directly, share screenshots, and request clarifications in real-time.',
    useCases: [
      'A technician asking a user for a photo of a broken pipe.',
      'A user following up to provide additional details about a reported incident.'
    ],
    benefits: [
      'Keeps all communication strictly tied to the complaint record.',
      'Faster back-and-forth communication.',
      'Supports file attachments and rich text.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'lifecycle-management',
    iconName: 'Workflow',
    title: 'Lifecycle Management',
    description: 'Full complaint lifecycle from Created → Assigned → In Progress → Escalated → Resolved → Closed.',
    longDescription: 'Bring structure to chaos. CaseBridge enforces strict state machines for complaint lifecycles. This ensures every issue follows a standardized path to resolution, preventing tickets from being prematurely closed or infinitely stalled.',
    useCases: [
      'A ticket automatically escalating to a manager after 48 hours of inactivity.',
      'Staff advancing a ticket state and requiring mandatory resolution notes.'
    ],
    benefits: [
      'Standardized operating procedures.',
      'Clear visibility into workflow bottlenecks.',
      'Automated SLA (Service Level Agreement) tracking.'
    ],
    demoType: 'lifecycle-workflow'
  },
  {
    id: 'cloud-ready-architecture',
    iconName: 'Globe',
    title: 'Cloud-Ready Architecture',
    description: 'Dockerized, scalable, and ready for AWS, DigitalOcean, or any cloud. MongoDB Atlas for global availability.',
    longDescription: 'Built for scale. Whether you are hosting on a single VPS or a massive Kubernetes cluster, CaseBridge is containerized and horizontally scalable. Our stateless backend architecture pairs perfectly with managed databases like MongoDB Atlas.',
    useCases: [
      'Deploying instantly via Docker Compose for a small office.',
      'Scaling up via Kubernetes to handle thousands of concurrent university students.'
    ],
    benefits: [
      'Vendor-agnostic deployment options.',
      'Extremely high availability and fault tolerance.',
      'Modern, maintainable technology stack.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'enterprise-security',
    iconName: 'Lock',
    title: 'Enterprise Security',
    description: 'JWT authentication, encrypted data, CORS protection, and organization-scoped data isolation by default.',
    longDescription: 'Security is not an afterthought. CaseBridge implements industry-standard protections including bcrypt password hashing, HTTP-only JWT cookies, strict CORS policies, and rate limiting to protect your organizational data from unauthorized access.',
    useCases: [
      'Securing sensitive HR complaints from unauthorized staff.',
      'Defending the public API against brute-force login attempts.'
    ],
    benefits: [
      'Peace of mind for sensitive data.',
      'Compliance with standard data protection regulations.',
      'Robust defense against common web vulnerabilities.'
    ],
    demoType: 'static-mockup'
  },
  {
    id: 'advanced-analytics',
    iconName: 'BarChart3',
    title: 'Advanced Analytics',
    description: 'Generate deep insights into complaint resolution times, staff performance, and organization-wide trends.',
    longDescription: 'Transform raw complaint data into actionable intelligence. Our analytics engine automatically visualizes resolution metrics, identifies bottlenecks, and highlights peak complaint periods. Export reports to PDF or CSV with a single click.',
    useCases: [
      'An Org Admin reviewing the average resolution time of the IT department.',
      'A Super Admin comparing performance across different university campuses.'
    ],
    benefits: [
      'Data-driven decision making.',
      'Identify and reward high-performing staff members.',
      'Predict and prepare for high-volume periods.'
    ],
    demoType: 'analytics-charts'
  },
  {
    id: 'immutable-audit-logs',
    iconName: 'ShieldCheck',
    title: 'Immutable Audit Logs',
    description: 'Track every single action, status change, and system event to ensure complete historical accountability.',
    longDescription: 'Accountability is key to trust. CaseBridge maintains an immutable ledger of every action taken within the system. From logins to status changes, you always have a cryptographic trail of who did what, and exactly when they did it.',
    useCases: [
      'Investigating a dispute over when a complaint was officially closed.',
      'Auditing system access logs for unauthorized activity.'
    ],
    benefits: [
      'Complete transparency and accountability.',
      'Invaluable for compliance and legal inquiries.',
      'Deters malicious internal behavior.'
    ],
    demoType: 'static-mockup'
  }
];
