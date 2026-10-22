/** Page-specific presentation metadata only; shared homepage data is untouched.
 * Add a project Markdown file in src/content/projects and it will appear on Work.
 */
export type WorkDetail = {
  type: string;
  eyebrow: string;
  short: string;
  availability: string;
  note?: string;
  presentation?: string;
};

export const workShowcase: Record<string, WorkDetail> = {
  trademind: {
    type: 'Financial Data & Research', eyebrow: 'PRIVATE RESEARCH & DEVELOPMENT',
    short: 'A research-grade market-data foundation with ingestion, provenance, recovery and analytical workflows.',
    availability: 'Ongoing · Private',
    note: 'Images are author-provided interface concepts, not screenshots of a public running product.',
    presentation: 'Systems Engineering / FinTech'
  },
  omnisyllabo: {
    type: 'Full-Stack EdTech', eyebrow: 'LIVE PRODUCT',
    short: 'A study companion that turns the Sindh Board Class XI syllabus into manageable daily actions.',
    availability: 'Live on Cloudflare Pages',
    presentation: 'EdTech / Full-Stack'
  },
  'beyond-basik': {
    type: 'Client Website', eyebrow: 'CLIENT PROJECT',
    short: 'A clear, responsive digital presence for a US tax preparation business.',
    availability: 'Public website',
    presentation: 'Client Website'
  },
  techsphere: {
    type: 'Internship Application', eyebrow: 'FULL-STACK INTERNSHIP',
    short: 'A course and services platform connecting React screens to API and database workflows.',
    availability: 'Repository & screenshots',
    presentation: 'Full-Stack / Internship'
  },
  'hopelink-ngo-management-system': {
    type: 'Full-Stack Web App', eyebrow: 'INDEPENDENT PROJECT',
    short: 'Campaigns, volunteers, supplies and simulated pledge workflows in one application.',
    availability: 'Source & local demo',
    presentation: 'Web Application'
  },
  'librarydesk-winforms': {
    type: 'Windows Desktop Software', eyebrow: 'DESKTOP APPLICATION',
    short: 'An operational desktop interface for library cataloging, borrowing and overdue tracking.',
    availability: 'Downloadable Windows release',
    presentation: 'C# / Windows Forms'
  },
  'easybank-cpp-banking-system': {
    type: 'C++ Systems Project', eyebrow: 'SOFTWARE SIMULATOR',
    short: 'An offline, fictional banking workflow that explores persistent ledgers and transactions.',
    availability: 'Source & local demo',
    presentation: 'C++ / SQLite'
  },
  'shos-operating-systems-simulator': {
    type: 'Operating Systems Simulation', eyebrow: 'COLLABORATIVE ACADEMIC PROJECT',
    short: 'An educational systems lab for CPU scheduling, FIFO memory and event reporting.',
    availability: 'Source & local demo',
    presentation: 'Python / Flask / OS Concepts'
  }
};

export function workImageCaption(id: string, index: number, src: string): string {
  if (id === 'trademind') return `Illustrative TradeMind interface concept ${index + 1}`;
  const basename = decodeURIComponent(src.split('/').pop() || '');
  const description = basename.replace(/^\d+-/, '').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c=>c.toUpperCase());
  return description || 'Project screenshot';
}
