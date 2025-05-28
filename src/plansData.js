// Plan configuration data - easy to edit without touching component code
export const plansData = {
  baseFeatures: [
    "Python and SQL cells",
    "Count AI",
    "No-code tables and visualizations",
    "Reporting",
    "User permissions",
    "dbt + GitHub integration",
    "Count Metrics semantic layer",
    "SOC2 and GDPR compliance",
    "Result caching",
    "In-browser DuckDB",
  ],

  // Additional features with the first plan they're available in
  additionalFeatures: {
    "Custom fonts, colors, and styles": "team",
    "Priority support": "team",
    "Canvas tags": "team",
    "Scheduled queries": "team",
    "Full usage telemetry": "scale",
    Embedding: "scale",
    "Okta SSO": "scale",
    "HIPPA compliance": "enterprise",
    "Row-level security": "enterprise",
    "Custom data storage location": "enterprise",
    "Custom SSO": "enterprise",
    "Disable exports": "enterprise",
    API: "scale",
  },

  pro: {
    name: "Pro",
    pricePerEditor: 99,
    description:
      "The best way for analysts to turn BI into business improvement.",
    minSeats: 1,
    collaborators: 75,
    featureList: [
      "2 database connections",
      "2 alerts",
      "14-day version history",
    ],
  },
  team: {
    name: "Team",
    pricePerEditor: 79,
    description:
      "Ideal for data teams to explore data and tell stories that drive real change.",
    minSeats: 12,
    collaborators: 150,
    duckDb: { capacity: "4GB", saving: "~15%" },
    featureList: [
      "Unlimited database connections",
      "Unlimited alerts",
      "Unlimited version history",
      "4GB DuckDB Server Query Cache",
      "Project permissions",
      "Custom templates",
    ],
  },
  scale: {
    name: "Scale",
    pricePerEditor: 59,
    description:
      "The best BI tool in the world, for the best data-led organizations in the world.",
    minSeats: 40,
    collaborators: 400,
    duckDb: { capacity: "16GB", saving: "~30%" },
    featureList: [
      "Unlimited database connections",
      "Unlimited alerts",
      "Unlimited version history",
      "16GB DuckDB Server Query Cache",
      "Project + Group permissions",
      "Report-only user role",
      "Custom templates",
      "Secure embedding",
      "Custom workspace styles",
      "API Access",
      "Okta SSO",
    ],
  },
};

// Number formatter for currency display
export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
