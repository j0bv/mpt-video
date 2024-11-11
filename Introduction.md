src/
├── agents/
│   ├── base/
│   │   └── ContentCreationAgent.js       // Base agent class
│   ├── ScraperAgent.js
│   ├── ScriptGeneratorAgent.js
│   ├── VisualsCreatorAgent.js
│   ├── AudioAgent.js
│   ├── QualityControlAgent.js
│   └── index.js                         // Exports all agents
│
├── orchestration/
│   ├── ContentCreationOrchestra.js      // Main orchestration class
│   └── tasks.js                         // Task definitions
│
└── index.js                             // Main entry point