import type { FunctionCategory } from "@/types";

export const INDUSTRIES = [
  "Public Sector", "E-Commerce", "Insurance", "Healthcare", "Logistics",
  "Financial Services", "Manufacturing", "Real Estate", "Legal", "Education",
  "Tech/SaaS", "Retail", "Energy/Utilities", "Telecom",
  "Media/Entertainment", "Construction", "Hospitality", "Agriculture",
];

export const FUNCTION_CATEGORIES: FunctionCategory[] = [
  {
    key: "sales",
    name: "Sales",
    subFunctions: [
      { key: "business-development", name: "Business Development" },
      { key: "account-management", name: "Account Management" },
      { key: "revenue-operations", name: "Revenue Operations" },
    ],
  },
  {
    key: "customer-support",
    name: "Customer Support",
    subFunctions: [
      { key: "contact-center", name: "Contact Center" },
      { key: "field-service", name: "Field Service" },
      { key: "customer-success", name: "Success & Retention" },
    ],
  },
  {
    key: "hr",
    name: "HR",
    subFunctions: [
      { key: "talent-acquisition", name: "Talent Acquisition" },
      { key: "workforce-management", name: "Workforce Management" },
      { key: "hr-compliance", name: "Compliance & Benefits" },
    ],
  },
  {
    key: "finance",
    name: "Finance",
    subFunctions: [
      { key: "accounting-arap", name: "Accounting & AR/AP" },
      { key: "fpa-reporting", name: "FP&A & Reporting" },
      { key: "risk-compliance", name: "Risk & Compliance" },
      { key: "procurement", name: "Procurement" },
    ],
  },
  {
    key: "it-engineering",
    name: "IT / Engineering",
    subFunctions: [
      { key: "cybersecurity", name: "Cybersecurity / SOC" },
      { key: "devops-sre", name: "DevOps / SRE" },
      { key: "data-engineering", name: "Data Engineering" },
      { key: "software-dev", name: "Software Development" },
    ],
  },
  {
    key: "operations",
    name: "Operations",
    subFunctions: [
      { key: "supply-chain", name: "Supply Chain" },
      { key: "facilities", name: "Facilities & Maintenance" },
      { key: "quality-regulatory", name: "Quality / Regulatory" },
      { key: "program-management", name: "Program Management" },
    ],
  },
];

// All sub-function keys flattened
export const ALL_SUB_FUNCTIONS = FUNCTION_CATEGORIES.flatMap((cat) =>
  cat.subFunctions.map((sf) => ({ ...sf, parentKey: cat.key, parentName: cat.name }))
);

// Total cells: 18 industries × 21 sub-functions = 378
export const TOTAL_CELLS = INDUSTRIES.length * ALL_SUB_FUNCTIONS.length;
