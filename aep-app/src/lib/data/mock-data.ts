import type {
  User, Team, CompetencyDomain, CompetencySubdomain, Skill,
  Question, Assessment, AssessmentQuestion, AssessmentSession,
  SessionResponse, Score, ProficiencyRating
} from '@/lib/types';

// ============ USERS ============
export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@modernit.com', fullName: 'Sara Al-Rashid', role: 'admin', teamId: null, practiceArea: null, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'manager1@modernit.com', fullName: 'Ahmed Hassan', role: 'manager', teamId: 't1', practiceArea: 'software_development', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u3', email: 'manager2@modernit.com', fullName: 'Fatima Al-Sayed', role: 'manager', teamId: 't2', practiceArea: 'application_integration', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u4', email: 'dev1@modernit.com', fullName: 'Omar Khalil', role: 'team_member', teamId: 't1', practiceArea: 'software_development', isActive: true, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'u5', email: 'dev2@modernit.com', fullName: 'Layla Mansour', role: 'team_member', teamId: 't1', practiceArea: 'software_development', isActive: true, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'u6', email: 'dev3@modernit.com', fullName: 'Yusuf Ibrahim', role: 'team_member', teamId: 't1', practiceArea: 'software_development', isActive: true, createdAt: '2026-01-20T00:00:00Z' },
  { id: 'u7', email: 'int1@modernit.com', fullName: 'Noor Al-Din', role: 'team_member', teamId: 't2', practiceArea: 'application_integration', isActive: true, createdAt: '2026-01-20T00:00:00Z' },
  { id: 'u8', email: 'int2@modernit.com', fullName: 'Hana Bakr', role: 'team_member', teamId: 't2', practiceArea: 'application_integration', isActive: true, createdAt: '2026-02-01T00:00:00Z' },
  { id: 'u9', email: 'hr@modernit.com', fullName: 'Mona Al-Faisal', role: 'hr_ld', teamId: null, practiceArea: null, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u10', email: 'sys1@modernit.com', fullName: 'Karim Nasser', role: 'team_member', teamId: 't3', practiceArea: 'system_integration', isActive: true, createdAt: '2026-02-01T00:00:00Z' },
];

// ============ TEAMS ============
export const mockTeams: Team[] = [
  { id: 't1', name: 'Core Development', practiceArea: 'software_development', managerId: 'u2', createdAt: '2026-01-01T00:00:00Z' },
  { id: 't2', name: 'Integration Services', practiceArea: 'application_integration', managerId: 'u3', createdAt: '2026-01-01T00:00:00Z' },
  { id: 't3', name: 'Infrastructure & Systems', practiceArea: 'system_integration', managerId: null, createdAt: '2026-01-01T00:00:00Z' },
];

// ============ COMPETENCY FRAMEWORK ============
export const mockDomains: CompetencyDomain[] = [
  // Software Development
  { id: 'd1', name: 'Programming Fundamentals', description: 'Data structures, algorithms, complexity analysis, OOP principles', practiceArea: 'software_development', sortOrder: 1 },
  { id: 'd2', name: 'Web & API Development', description: 'REST/GraphQL design, HTTP protocols, frontend frameworks, security', practiceArea: 'software_development', sortOrder: 2 },
  { id: 'd3', name: 'Database & SQL', description: 'Relational design, query optimization, NoSQL concepts', practiceArea: 'software_development', sortOrder: 3 },
  { id: 'd4', name: 'DevOps & CI/CD', description: 'Git workflows, Docker, Kubernetes, pipeline design, IaC', practiceArea: 'software_development', sortOrder: 4 },
  { id: 'd5', name: 'Software Quality & Testing', description: 'Unit/integration testing, TDD, code review, debugging', practiceArea: 'software_development', sortOrder: 5 },
  { id: 'd6', name: 'Architecture & Design Patterns', description: 'Microservices, SOLID, design patterns, DDD, scalability', practiceArea: 'software_development', sortOrder: 6 },
  // Application Integration
  { id: 'd7', name: 'API & Middleware Design', description: 'REST, SOAP, GraphQL, API gateway patterns, versioning', practiceArea: 'application_integration', sortOrder: 1 },
  { id: 'd8', name: 'Integration Platforms', description: 'MuleSoft, Azure Logic Apps, IBM App Connect, Boomi', practiceArea: 'application_integration', sortOrder: 2 },
  { id: 'd9', name: 'Messaging & Events', description: 'Kafka, RabbitMQ, Azure Service Bus, event-driven architecture', practiceArea: 'application_integration', sortOrder: 3 },
  { id: 'd10', name: 'Data Transformation', description: 'XSLT, JSONata, DataWeave, canonical data models', practiceArea: 'application_integration', sortOrder: 4 },
  // System Integration
  { id: 'd11', name: 'Enterprise Architecture', description: 'SOA, ESB, microservices, service mesh, cloud-native patterns', practiceArea: 'system_integration', sortOrder: 1 },
  { id: 'd12', name: 'Cloud Platforms', description: 'AWS/Azure/GCP services, IaaS/PaaS/SaaS, hybrid cloud', practiceArea: 'system_integration', sortOrder: 2 },
  { id: 'd13', name: 'Monitoring & Observability', description: 'Distributed tracing, log aggregation, alerting, SRE', practiceArea: 'system_integration', sortOrder: 3 },
];

export const mockSubdomains: CompetencySubdomain[] = [
  // Programming Fundamentals
  { id: 'sd1', domainId: 'd1', name: 'Data Structures', description: 'Arrays, linked lists, trees, graphs, hash tables', sortOrder: 1 },
  { id: 'sd2', domainId: 'd1', name: 'Algorithms', description: 'Sorting, searching, dynamic programming, greedy', sortOrder: 2 },
  { id: 'sd3', domainId: 'd1', name: 'OOP Principles', description: 'Encapsulation, inheritance, polymorphism, abstraction', sortOrder: 3 },
  // Web & API
  { id: 'sd4', domainId: 'd2', name: 'REST API Design', description: 'RESTful conventions, HTTP methods, status codes', sortOrder: 1 },
  { id: 'sd5', domainId: 'd2', name: 'Frontend Frameworks', description: 'React, Angular, Vue ecosystem', sortOrder: 2 },
  // Database
  { id: 'sd6', domainId: 'd3', name: 'SQL Querying', description: 'SELECT, JOIN, subqueries, aggregation', sortOrder: 1 },
  { id: 'sd7', domainId: 'd3', name: 'Database Design', description: 'Normalization, indexing, schema design', sortOrder: 2 },
  // DevOps
  { id: 'sd8', domainId: 'd4', name: 'Git & Version Control', description: 'Branching strategies, merge workflows', sortOrder: 1 },
  { id: 'sd9', domainId: 'd4', name: 'Containerization', description: 'Docker, Kubernetes fundamentals', sortOrder: 2 },
  // Testing
  { id: 'sd10', domainId: 'd5', name: 'Unit Testing', description: 'Test frameworks, mocking, coverage', sortOrder: 1 },
  // Architecture
  { id: 'sd11', domainId: 'd6', name: 'Design Patterns', description: 'GoF patterns, architectural patterns', sortOrder: 1 },
  { id: 'sd12', domainId: 'd6', name: 'Microservices', description: 'Service decomposition, communication patterns', sortOrder: 2 },
  // API & Middleware
  { id: 'sd13', domainId: 'd7', name: 'API Gateway Patterns', description: 'Rate limiting, auth, routing', sortOrder: 1 },
  { id: 'sd14', domainId: 'd8', name: 'MuleSoft', description: 'Anypoint Platform, DataWeave', sortOrder: 1 },
  // Messaging
  { id: 'sd15', domainId: 'd9', name: 'Apache Kafka', description: 'Topics, partitions, consumer groups', sortOrder: 1 },
  // Cloud
  { id: 'sd16', domainId: 'd12', name: 'Azure Services', description: 'Compute, storage, networking on Azure', sortOrder: 1 },
  { id: 'sd17', domainId: 'd12', name: 'AWS Services', description: 'EC2, S3, Lambda, RDS', sortOrder: 2 },
];

export const mockSkills: Skill[] = [
  // Data Structures
  { id: 'sk1', subdomainId: 'sd1', name: 'Arrays & Lists', description: 'Dynamic arrays, linked lists, operations', sortOrder: 1 },
  { id: 'sk2', subdomainId: 'sd1', name: 'Trees & Graphs', description: 'Binary trees, BST, graph traversal', sortOrder: 2 },
  { id: 'sk3', subdomainId: 'sd1', name: 'Hash Tables', description: 'Hashing, collision resolution', sortOrder: 3 },
  // Algorithms
  { id: 'sk4', subdomainId: 'sd2', name: 'Sorting Algorithms', description: 'QuickSort, MergeSort, time complexity', sortOrder: 1 },
  { id: 'sk5', subdomainId: 'sd2', name: 'Search Algorithms', description: 'Binary search, BFS, DFS', sortOrder: 2 },
  // OOP
  { id: 'sk6', subdomainId: 'sd3', name: 'SOLID Principles', description: 'Single responsibility, Open-closed, etc.', sortOrder: 1 },
  // REST
  { id: 'sk7', subdomainId: 'sd4', name: 'HTTP Methods & Status Codes', description: 'GET, POST, PUT, DELETE, status codes', sortOrder: 1 },
  { id: 'sk8', subdomainId: 'sd4', name: 'API Versioning', description: 'URL, header, query param versioning', sortOrder: 2 },
  // Frontend
  { id: 'sk9', subdomainId: 'sd5', name: 'React Fundamentals', description: 'Components, hooks, state management', sortOrder: 1 },
  // SQL
  { id: 'sk10', subdomainId: 'sd6', name: 'JOIN Operations', description: 'INNER, LEFT, RIGHT, FULL joins', sortOrder: 1 },
  { id: 'sk11', subdomainId: 'sd7', name: 'Normalization', description: '1NF, 2NF, 3NF, BCNF', sortOrder: 1 },
  // Git
  { id: 'sk12', subdomainId: 'sd8', name: 'Git Branching', description: 'Feature branches, merge vs rebase', sortOrder: 1 },
  // Docker
  { id: 'sk13', subdomainId: 'sd9', name: 'Docker Basics', description: 'Dockerfile, images, containers', sortOrder: 1 },
  // Testing
  { id: 'sk14', subdomainId: 'sd10', name: 'Test Frameworks', description: 'Jest, JUnit, pytest', sortOrder: 1 },
  // Design Patterns
  { id: 'sk15', subdomainId: 'sd11', name: 'Creational Patterns', description: 'Singleton, Factory, Builder', sortOrder: 1 },
  // Microservices
  { id: 'sk16', subdomainId: 'sd12', name: 'Service Communication', description: 'REST, gRPC, message queues', sortOrder: 1 },
  // Integration skills
  { id: 'sk17', subdomainId: 'sd13', name: 'API Gateway Config', description: 'Rate limiting, routing rules', sortOrder: 1 },
  { id: 'sk18', subdomainId: 'sd14', name: 'DataWeave', description: 'MuleSoft data transformation language', sortOrder: 1 },
  { id: 'sk19', subdomainId: 'sd15', name: 'Kafka Fundamentals', description: 'Producers, consumers, topics', sortOrder: 1 },
  // Cloud
  { id: 'sk20', subdomainId: 'sd16', name: 'Azure Compute', description: 'VMs, App Service, Functions', sortOrder: 1 },
  { id: 'sk21', subdomainId: 'sd17', name: 'AWS Lambda', description: 'Serverless functions on AWS', sortOrder: 1 },
];

// ============ QUESTIONS ============
export const mockQuestions: Question[] = [
  {
    id: 'q1', title: 'Array Time Complexity', body: 'What is the time complexity of accessing an element in an array by index?',
    questionType: 'mcq', options: [
      { id: 'q1o1', text: 'O(1)', isCorrect: true },
      { id: 'q1o2', text: 'O(n)', isCorrect: false },
      { id: 'q1o3', text: 'O(log n)', isCorrect: false },
      { id: 'q1o4', text: 'O(n²)', isCorrect: false },
    ],
    explanation: 'Arrays provide constant-time O(1) access by index due to contiguous memory layout.',
    difficulty: 'easy', bloomsLevel: 'remember', skillId: 'sk1', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 1,
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'q2', title: 'Binary Search Prerequisite', body: 'What is a prerequisite for performing binary search on an array?',
    questionType: 'mcq', options: [
      { id: 'q2o1', text: 'The array must be sorted', isCorrect: true },
      { id: 'q2o2', text: 'The array must have unique elements', isCorrect: false },
      { id: 'q2o3', text: 'The array must be of even length', isCorrect: false },
      { id: 'q2o4', text: 'The array must contain integers only', isCorrect: false },
    ],
    explanation: 'Binary search requires the array to be sorted to correctly eliminate half the search space.',
    difficulty: 'easy', bloomsLevel: 'remember', skillId: 'sk5', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 1,
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'q3', title: 'SOLID - Single Responsibility', body: 'Which SOLID principle states that a class should have only one reason to change?',
    questionType: 'mcq', options: [
      { id: 'q3o1', text: 'Single Responsibility Principle', isCorrect: true },
      { id: 'q3o2', text: 'Open-Closed Principle', isCorrect: false },
      { id: 'q3o3', text: 'Liskov Substitution Principle', isCorrect: false },
      { id: 'q3o4', text: 'Interface Segregation Principle', isCorrect: false },
    ],
    explanation: 'SRP states a class should have one and only one reason to change.',
    difficulty: 'easy', bloomsLevel: 'remember', skillId: 'sk6', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 1,
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'q4', title: 'HTTP Status Codes', body: 'Which HTTP status code indicates a resource was successfully created?',
    questionType: 'mcq', options: [
      { id: 'q4o1', text: '201 Created', isCorrect: true },
      { id: 'q4o2', text: '200 OK', isCorrect: false },
      { id: 'q4o3', text: '204 No Content', isCorrect: false },
      { id: 'q4o4', text: '301 Moved Permanently', isCorrect: false },
    ],
    explanation: '201 Created is the standard response for successful resource creation.',
    difficulty: 'easy', bloomsLevel: 'remember', skillId: 'sk7', status: 'approved',
    createdBy: 'u1', reviewedBy: null, reviewNotes: '', points: 1,
    createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'q5', title: 'React Hooks', body: 'Which React hook is used for side effects like data fetching?',
    questionType: 'mcq', options: [
      { id: 'q5o1', text: 'useEffect', isCorrect: true },
      { id: 'q5o2', text: 'useState', isCorrect: false },
      { id: 'q5o3', text: 'useContext', isCorrect: false },
      { id: 'q5o4', text: 'useRef', isCorrect: false },
    ],
    explanation: 'useEffect is the hook for performing side effects in React functional components.',
    difficulty: 'easy', bloomsLevel: 'understand', skillId: 'sk9', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 1,
    createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'q6', title: 'SQL JOIN Types', body: 'Which JOIN type returns only rows that have matching values in both tables?',
    questionType: 'mcq', options: [
      { id: 'q6o1', text: 'INNER JOIN', isCorrect: true },
      { id: 'q6o2', text: 'LEFT JOIN', isCorrect: false },
      { id: 'q6o3', text: 'RIGHT JOIN', isCorrect: false },
      { id: 'q6o4', text: 'FULL OUTER JOIN', isCorrect: false },
    ],
    explanation: 'INNER JOIN returns only rows where there is a match in both tables.',
    difficulty: 'easy', bloomsLevel: 'remember', skillId: 'sk10', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 1,
    createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'q7', title: 'Tree Traversal', body: 'Which traversal visits nodes in the order: left subtree, root, right subtree?',
    questionType: 'mcq', options: [
      { id: 'q7o1', text: 'Inorder', isCorrect: true },
      { id: 'q7o2', text: 'Preorder', isCorrect: false },
      { id: 'q7o3', text: 'Postorder', isCorrect: false },
      { id: 'q7o4', text: 'Level order', isCorrect: false },
    ],
    explanation: 'Inorder traversal visits left subtree, then root, then right subtree.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk2', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 2,
    createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'q8', title: 'Stable Sort', body: 'Which of the following sorting algorithms are stable? Select all that apply.',
    questionType: 'multi_select', options: [
      { id: 'q8o1', text: 'Merge Sort', isCorrect: true },
      { id: 'q8o2', text: 'Quick Sort', isCorrect: false },
      { id: 'q8o3', text: 'Insertion Sort', isCorrect: true },
      { id: 'q8o4', text: 'Heap Sort', isCorrect: false },
    ],
    explanation: 'Merge Sort and Insertion Sort are stable. Quick Sort and Heap Sort are not.',
    difficulty: 'medium', bloomsLevel: 'analyze', skillId: 'sk4', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 2,
    createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'q9', title: 'Docker Layers', body: 'What happens when you modify a layer in a Docker image?',
    questionType: 'mcq', options: [
      { id: 'q9o1', text: 'All subsequent layers are rebuilt', isCorrect: true },
      { id: 'q9o2', text: 'Only that layer is rebuilt', isCorrect: false },
      { id: 'q9o3', text: 'The entire image is rebuilt from scratch', isCorrect: false },
      { id: 'q9o4', text: 'No layers are rebuilt; changes are merged', isCorrect: false },
    ],
    explanation: 'Docker uses a layered caching system. Changing a layer invalidates all subsequent layers.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk13', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 2,
    createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'q10', title: 'Git Merge vs Rebase', body: 'What is a key difference between git merge and git rebase?',
    questionType: 'mcq', options: [
      { id: 'q10o1', text: 'Rebase rewrites commit history; merge preserves it', isCorrect: true },
      { id: 'q10o2', text: 'Merge is faster than rebase', isCorrect: false },
      { id: 'q10o3', text: 'Rebase can only be used on the main branch', isCorrect: false },
      { id: 'q10o4', text: 'There is no functional difference', isCorrect: false },
    ],
    explanation: 'Rebase replays commits on top of another branch, creating a linear history.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk12', status: 'approved',
    createdBy: 'u1', reviewedBy: null, reviewNotes: '', points: 2,
    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'q11', title: 'Database Normalization', body: 'What problem does Third Normal Form (3NF) solve?',
    questionType: 'mcq', options: [
      { id: 'q11o1', text: 'Transitive dependencies', isCorrect: true },
      { id: 'q11o2', text: 'Repeating groups', isCorrect: false },
      { id: 'q11o3', text: 'Partial dependencies', isCorrect: false },
      { id: 'q11o4', text: 'Multi-valued dependencies', isCorrect: false },
    ],
    explanation: '3NF removes transitive dependencies where non-key attributes depend on other non-key attributes.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk11', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 2,
    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'q12', title: 'Singleton Pattern', body: 'In which scenario is the Singleton pattern most appropriate?',
    questionType: 'mcq', options: [
      { id: 'q12o1', text: 'Managing a shared database connection pool', isCorrect: true },
      { id: 'q12o2', text: 'Creating multiple user instances', isCorrect: false },
      { id: 'q12o3', text: 'Rendering UI components', isCorrect: false },
      { id: 'q12o4', text: 'Parsing JSON data', isCorrect: false },
    ],
    explanation: 'Singleton ensures a single instance, ideal for shared resources like connection pools.',
    difficulty: 'medium', bloomsLevel: 'apply', skillId: 'sk15', status: 'approved',
    createdBy: 'u1', reviewedBy: 'u2', reviewNotes: '', points: 2,
    createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'q13', title: 'Kafka Question (Draft)', body: 'What is the role of a consumer group in Kafka?',
    questionType: 'mcq', options: [
      { id: 'q13o1', text: 'Enables parallel consumption of topic partitions', isCorrect: true },
      { id: 'q13o2', text: 'Groups producers together', isCorrect: false },
      { id: 'q13o3', text: 'Creates topic backups', isCorrect: false },
      { id: 'q13o4', text: 'Manages broker health', isCorrect: false },
    ],
    explanation: 'Consumer groups allow multiple consumers to read from different partitions in parallel.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk19', status: 'draft',
    createdBy: 'u3', reviewedBy: null, reviewNotes: '', points: 2,
    createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'q14', title: 'Hash Collision', body: 'Which technique resolves hash collisions by storing multiple elements at the same index?',
    questionType: 'mcq', options: [
      { id: 'q14o1', text: 'Chaining', isCorrect: true },
      { id: 'q14o2', text: 'Linear probing', isCorrect: false },
      { id: 'q14o3', text: 'Quadratic probing', isCorrect: false },
      { id: 'q14o4', text: 'Double hashing', isCorrect: false },
    ],
    explanation: 'Chaining uses linked lists at each bucket to store multiple elements.',
    difficulty: 'medium', bloomsLevel: 'understand', skillId: 'sk3', status: 'review',
    createdBy: 'u2', reviewedBy: null, reviewNotes: '', points: 2,
    createdAt: '2026-03-05T00:00:00Z', updatedAt: '2026-03-05T00:00:00Z',
  },
];

// ============ ASSESSMENTS ============
export const mockAssessments: Assessment[] = [
  {
    id: 'a1', title: 'Software Development Fundamentals', description: 'Baseline assessment covering programming fundamentals, REST APIs, SQL, and testing.',
    practiceArea: 'software_development', timeLimitMinutes: 45, passingScorePct: 70, randomizeQuestions: true,
    questionsCount: null, openAt: '2026-03-01T00:00:00Z', closeAt: '2026-04-01T00:00:00Z',
    status: 'published', createdBy: 'u1', createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'a2', title: 'Architecture & Design Patterns', description: 'Advanced assessment on design patterns, microservices, and system architecture.',
    practiceArea: 'software_development', timeLimitMinutes: 30, passingScorePct: 60, randomizeQuestions: false,
    questionsCount: null, openAt: '2026-03-15T00:00:00Z', closeAt: '2026-04-15T00:00:00Z',
    status: 'published', createdBy: 'u1', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'a3', title: 'Integration Basics', description: 'Covers API design, messaging patterns, and integration platforms.',
    practiceArea: 'application_integration', timeLimitMinutes: 30, passingScorePct: 65, randomizeQuestions: true,
    questionsCount: null, openAt: null, closeAt: null,
    status: 'draft', createdBy: 'u1', createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z',
  },
];

export const mockAssessmentQuestions: AssessmentQuestion[] = [
  // Assessment 1: Software Development Fundamentals (10 questions)
  { id: 'aq1', assessmentId: 'a1', questionId: 'q1', sortOrder: 1, weight: 1 },
  { id: 'aq2', assessmentId: 'a1', questionId: 'q2', sortOrder: 2, weight: 1 },
  { id: 'aq3', assessmentId: 'a1', questionId: 'q3', sortOrder: 3, weight: 1 },
  { id: 'aq4', assessmentId: 'a1', questionId: 'q4', sortOrder: 4, weight: 1 },
  { id: 'aq5', assessmentId: 'a1', questionId: 'q5', sortOrder: 5, weight: 1 },
  { id: 'aq6', assessmentId: 'a1', questionId: 'q6', sortOrder: 6, weight: 1 },
  { id: 'aq7', assessmentId: 'a1', questionId: 'q7', sortOrder: 7, weight: 1.5 },
  { id: 'aq8', assessmentId: 'a1', questionId: 'q8', sortOrder: 8, weight: 1.5 },
  { id: 'aq9', assessmentId: 'a1', questionId: 'q9', sortOrder: 9, weight: 1.5 },
  { id: 'aq10', assessmentId: 'a1', questionId: 'q10', sortOrder: 10, weight: 1 },
  // Assessment 2: Architecture
  { id: 'aq11', assessmentId: 'a2', questionId: 'q12', sortOrder: 1, weight: 1 },
  { id: 'aq12', assessmentId: 'a2', questionId: 'q7', sortOrder: 2, weight: 1 },
  { id: 'aq13', assessmentId: 'a2', questionId: 'q11', sortOrder: 3, weight: 1 },
];

// ============ SESSIONS & SCORES (Pre-populated for demo) ============
export const mockSessions: AssessmentSession[] = [
  // Omar completed Assessment 1
  {
    id: 'ses1', assessmentId: 'a1', userId: 'u4', status: 'submitted',
    startedAt: '2026-03-05T09:00:00Z', submittedAt: '2026-03-05T09:35:00Z',
    timeRemainingSeconds: 600, questionOrder: ['q1','q3','q5','q7','q2','q4','q6','q8','q9','q10'],
    createdAt: '2026-03-05T09:00:00Z',
  },
  // Layla completed Assessment 1
  {
    id: 'ses2', assessmentId: 'a1', userId: 'u5', status: 'submitted',
    startedAt: '2026-03-06T10:00:00Z', submittedAt: '2026-03-06T10:40:00Z',
    timeRemainingSeconds: 300, questionOrder: ['q2','q4','q1','q6','q3','q5','q7','q8','q9','q10'],
    createdAt: '2026-03-06T10:00:00Z',
  },
  // Yusuf completed Assessment 1
  {
    id: 'ses3', assessmentId: 'a1', userId: 'u6', status: 'submitted',
    startedAt: '2026-03-07T14:00:00Z', submittedAt: '2026-03-07T14:42:00Z',
    timeRemainingSeconds: 180, questionOrder: ['q5','q1','q3','q2','q4','q6','q7','q8','q9','q10'],
    createdAt: '2026-03-07T14:00:00Z',
  },
];

export const mockResponses: SessionResponse[] = [
  // Omar's responses (8/10 correct)
  { id: 'r1', sessionId: 'ses1', questionId: 'q1', selectedOptions: ['q1o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:03:00Z' },
  { id: 'r2', sessionId: 'ses1', questionId: 'q2', selectedOptions: ['q2o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:06:00Z' },
  { id: 'r3', sessionId: 'ses1', questionId: 'q3', selectedOptions: ['q3o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:09:00Z' },
  { id: 'r4', sessionId: 'ses1', questionId: 'q4', selectedOptions: ['q4o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:12:00Z' },
  { id: 'r5', sessionId: 'ses1', questionId: 'q5', selectedOptions: ['q5o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:15:00Z' },
  { id: 'r6', sessionId: 'ses1', questionId: 'q6', selectedOptions: ['q6o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-05T09:18:00Z' },
  { id: 'r7', sessionId: 'ses1', questionId: 'q7', selectedOptions: ['q7o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-05T09:22:00Z' },
  { id: 'r8', sessionId: 'ses1', questionId: 'q8', selectedOptions: ['q8o1','q8o3'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-05T09:26:00Z' },
  { id: 'r9', sessionId: 'ses1', questionId: 'q9', selectedOptions: ['q9o1'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-05T09:30:00Z' },
  { id: 'r10', sessionId: 'ses1', questionId: 'q10', selectedOptions: ['q10o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-05T09:34:00Z' },
  // Layla's responses (6/10 correct)
  { id: 'r11', sessionId: 'ses2', questionId: 'q1', selectedOptions: ['q1o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-06T10:04:00Z' },
  { id: 'r12', sessionId: 'ses2', questionId: 'q2', selectedOptions: ['q2o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-06T10:08:00Z' },
  { id: 'r13', sessionId: 'ses2', questionId: 'q3', selectedOptions: ['q3o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-06T10:12:00Z' },
  { id: 'r14', sessionId: 'ses2', questionId: 'q4', selectedOptions: ['q4o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-06T10:16:00Z' },
  { id: 'r15', sessionId: 'ses2', questionId: 'q5', selectedOptions: ['q5o3'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-06T10:20:00Z' },
  { id: 'r16', sessionId: 'ses2', questionId: 'q6', selectedOptions: ['q6o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-06T10:24:00Z' },
  { id: 'r17', sessionId: 'ses2', questionId: 'q7', selectedOptions: ['q7o1'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-06T10:28:00Z' },
  { id: 'r18', sessionId: 'ses2', questionId: 'q8', selectedOptions: ['q8o1'], isCorrect: false, pointsEarned: 1, answeredAt: '2026-03-06T10:32:00Z' },
  { id: 'r19', sessionId: 'ses2', questionId: 'q9', selectedOptions: ['q9o3'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-06T10:36:00Z' },
  { id: 'r20', sessionId: 'ses2', questionId: 'q10', selectedOptions: ['q10o1'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-06T10:39:00Z' },
  // Yusuf's responses (5/10 correct)
  { id: 'r21', sessionId: 'ses3', questionId: 'q1', selectedOptions: ['q1o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-07T14:04:00Z' },
  { id: 'r22', sessionId: 'ses3', questionId: 'q2', selectedOptions: ['q2o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-07T14:08:00Z' },
  { id: 'r23', sessionId: 'ses3', questionId: 'q3', selectedOptions: ['q3o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-07T14:12:00Z' },
  { id: 'r24', sessionId: 'ses3', questionId: 'q4', selectedOptions: ['q4o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-07T14:16:00Z' },
  { id: 'r25', sessionId: 'ses3', questionId: 'q5', selectedOptions: ['q5o1'], isCorrect: true, pointsEarned: 1, answeredAt: '2026-03-07T14:20:00Z' },
  { id: 'r26', sessionId: 'ses3', questionId: 'q6', selectedOptions: ['q6o2'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-07T14:24:00Z' },
  { id: 'r27', sessionId: 'ses3', questionId: 'q7', selectedOptions: ['q7o1'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-07T14:28:00Z' },
  { id: 'r28', sessionId: 'ses3', questionId: 'q8', selectedOptions: ['q8o2','q8o4'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-07T14:32:00Z' },
  { id: 'r29', sessionId: 'ses3', questionId: 'q9', selectedOptions: ['q9o1'], isCorrect: true, pointsEarned: 2, answeredAt: '2026-03-07T14:36:00Z' },
  { id: 'r30', sessionId: 'ses3', questionId: 'q10', selectedOptions: ['q10o3'], isCorrect: false, pointsEarned: 0, answeredAt: '2026-03-07T14:40:00Z' },
];

export const mockScores: Score[] = [
  { id: 'sc1', sessionId: 'ses1', userId: 'u4', assessmentId: 'a1', totalPoints: 10, maxPoints: 14, percentage: 71.43, passed: true, scoredAt: '2026-03-05T09:35:00Z' },
  { id: 'sc2', sessionId: 'ses2', userId: 'u5', assessmentId: 'a1', totalPoints: 9, maxPoints: 14, percentage: 64.29, passed: false, scoredAt: '2026-03-06T10:40:00Z' },
  { id: 'sc3', sessionId: 'ses3', userId: 'u6', assessmentId: 'a1', totalPoints: 7, maxPoints: 14, percentage: 50.00, passed: false, scoredAt: '2026-03-07T14:42:00Z' },
];

export const mockProficiencyRatings: ProficiencyRating[] = [
  // Omar (u4)
  { id: 'pr1', scoreId: 'sc1', userId: 'u4', skillId: 'sk1', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr2', scoreId: 'sc1', userId: 'u4', skillId: 'sk5', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr3', scoreId: 'sc1', userId: 'u4', skillId: 'sk6', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr4', scoreId: 'sc1', userId: 'u4', skillId: 'sk7', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr5', scoreId: 'sc1', userId: 'u4', skillId: 'sk9', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr6', scoreId: 'sc1', userId: 'u4', skillId: 'sk10', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr7', scoreId: 'sc1', userId: 'u4', skillId: 'sk2', level: 'foundational', pointsEarned: 0, maxPoints: 2, percentage: 0, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr8', scoreId: 'sc1', userId: 'u4', skillId: 'sk4', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr9', scoreId: 'sc1', userId: 'u4', skillId: 'sk13', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-05T09:35:00Z' },
  { id: 'pr10', scoreId: 'sc1', userId: 'u4', skillId: 'sk12', level: 'foundational', pointsEarned: 0, maxPoints: 2, percentage: 0, ratedAt: '2026-03-05T09:35:00Z' },
  // Layla (u5)
  { id: 'pr11', scoreId: 'sc2', userId: 'u5', skillId: 'sk1', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr12', scoreId: 'sc2', userId: 'u5', skillId: 'sk5', level: 'foundational', pointsEarned: 0, maxPoints: 1, percentage: 0, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr13', scoreId: 'sc2', userId: 'u5', skillId: 'sk6', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr14', scoreId: 'sc2', userId: 'u5', skillId: 'sk7', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr15', scoreId: 'sc2', userId: 'u5', skillId: 'sk9', level: 'foundational', pointsEarned: 0, maxPoints: 1, percentage: 0, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr16', scoreId: 'sc2', userId: 'u5', skillId: 'sk10', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr17', scoreId: 'sc2', userId: 'u5', skillId: 'sk2', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr18', scoreId: 'sc2', userId: 'u5', skillId: 'sk4', level: 'developing', pointsEarned: 1, maxPoints: 2, percentage: 50, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr19', scoreId: 'sc2', userId: 'u5', skillId: 'sk13', level: 'foundational', pointsEarned: 0, maxPoints: 2, percentage: 0, ratedAt: '2026-03-06T10:40:00Z' },
  { id: 'pr20', scoreId: 'sc2', userId: 'u5', skillId: 'sk12', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-06T10:40:00Z' },
  // Yusuf (u6)
  { id: 'pr21', scoreId: 'sc3', userId: 'u6', skillId: 'sk1', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr22', scoreId: 'sc3', userId: 'u6', skillId: 'sk5', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr23', scoreId: 'sc3', userId: 'u6', skillId: 'sk6', level: 'foundational', pointsEarned: 0, maxPoints: 1, percentage: 0, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr24', scoreId: 'sc3', userId: 'u6', skillId: 'sk7', level: 'foundational', pointsEarned: 0, maxPoints: 1, percentage: 0, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr25', scoreId: 'sc3', userId: 'u6', skillId: 'sk9', level: 'expert', pointsEarned: 1, maxPoints: 1, percentage: 100, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr26', scoreId: 'sc3', userId: 'u6', skillId: 'sk10', level: 'foundational', pointsEarned: 0, maxPoints: 1, percentage: 0, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr27', scoreId: 'sc3', userId: 'u6', skillId: 'sk2', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr28', scoreId: 'sc3', userId: 'u6', skillId: 'sk4', level: 'foundational', pointsEarned: 0, maxPoints: 2, percentage: 0, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr29', scoreId: 'sc3', userId: 'u6', skillId: 'sk13', level: 'expert', pointsEarned: 2, maxPoints: 2, percentage: 100, ratedAt: '2026-03-07T14:42:00Z' },
  { id: 'pr30', scoreId: 'sc3', userId: 'u6', skillId: 'sk12', level: 'foundational', pointsEarned: 0, maxPoints: 2, percentage: 0, ratedAt: '2026-03-07T14:42:00Z' },
];
