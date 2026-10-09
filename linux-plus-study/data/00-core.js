// Core data container. Domain files (domain1.js … domain5.js) push objectives into it.
window.LINUX_PLUS_DATA = window.LINUX_PLUS_DATA || { domains: [], objectives: [], acronyms: [] };
window.LINUX_PLUS_DATA.domains = [
  { id: 1, name: "System Management", weight: 23, icon: "SYS", color: "var(--d1)" },
  { id: 2, name: "Services and User Management", weight: 20, icon: "USR", color: "var(--d2)" },
  { id: 3, name: "Security", weight: 18, icon: "SEC", color: "var(--d3)" },
  { id: 4, name: "Automation, Orchestration, and Scripting", weight: 17, icon: "AUT", color: "var(--d4)" },
  { id: 5, name: "Troubleshooting", weight: 22, icon: "TRB", color: "var(--d5)" }
];
