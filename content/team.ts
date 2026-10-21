// Fill in real people here (later managed from the CMS). Leave name null to show "Team Member".
// photo: path under /public, e.g. "/team/ceo.jpg"
export type Member = { name: string | null; role: string; group: string; photo?: string; linkedin?: string };
export const team: Member[] = [
  { name: "Md Tariq Hossain", role: "CEO / Founder", group: "Core Leadership" },
  { name: null, role: "Chief Operating Officer", group: "Core Leadership" },
  { name: null, role: "Chief Marketing Officer", group: "Core Leadership" },
  { name: null, role: "Chief Technology Officer", group: "Core Leadership" },
  { name: null, role: "Senior Web Developer", group: "Software & SaaS" },
  { name: null, role: "Android App Developer", group: "Software & SaaS" },
  { name: null, role: "iOS Specialist", group: "Software & SaaS" },
  { name: null, role: "Lead UI/UX Designer", group: "Creative Design" },
  { name: null, role: "Graphic Designer (POD)", group: "Creative Design" },
  { name: null, role: "SEO Specialist", group: "Marketing" },
  { name: null, role: "Social Media Manager", group: "Marketing" },
  { name: null, role: "Customer Success Manager", group: "Support" },
];
