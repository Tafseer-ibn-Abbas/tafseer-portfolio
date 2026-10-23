/** Verified, public-facing details shared for the portfolio. */
export const profile = {
  name: 'Syed Muhammad Tafseer Raza Bukhari',
  shortName: 'Tafseer',
  identityNote: 'My professional name is Syed Muhammad Tafseer Raza Bukhari. Some linked platforms still display earlier names or usernames.',
  alternateNames: [
    'Syed Muhammad Tafseer',
    'SM Tafseer',
    'SM Tafseer Raza',
    'Syed Tafseer Abbas',
    'Zaki ibn Abbas',
    'Zaki ibn Zulfqar'
  ],
  headline: 'Software Engineer',
  secondaryHeadline: 'Full-Stack Product Builder',
  intro: 'I build full-stack products and data-intensive systems — from the interfaces people use to the infrastructure behind them.',
  about: [
    'I am a software engineer based in Karachi, Pakistan, with an interest in the kinds of technical challenges that do not come with obvious answers.',
    'My work spans full-stack web applications, data-intensive systems, backend workflows, databases, and desktop software. I enjoy understanding how the pieces fit together — from the interface to the underlying architecture.',
    'I am currently studying Computer Science at Sir Syed University of Engineering & Technology while continuing to develop independent and client projects.'
  ],
  capabilities: [
    { label: 'Full-stack products', detail: 'Interfaces, backend services, APIs and application workflows.' },
    { label: 'Data-intensive systems', detail: 'Ingestion pipelines, storage, databases and reliability work.' },
    { label: 'Frontend engineering', detail: 'Responsive interfaces, interaction design and thoughtful motion.' },
    { label: 'System problem-solving', detail: 'Breaking down complex requirements into maintainable components.' }
  ],
  education: [
    { institution: 'Sir Syed University of Engineering & Technology (SSUET)', program: 'BS Computer Science', period: '2024 — Expected 2028', detail: 'Karachi, Pakistan' }
  ],
  experience: [
    { company: 'TechSphere', role: 'Full Stack Development Intern', period: '02 Mar — 30 Apr 2026', detail: 'Completed a full-stack development internship, with work on a web-based learning and services platform.' }
  ],
  links: {
    github: 'https://github.com/Tafseer-ibn-Abbas',
    linkedin: 'https://www.linkedin.com/in/syed-tafseer-abbas-b61303345/',
    upwork: 'https://www.upwork.com/freelancers/~01d3f2debb765c21b0',
    fiverr: 'https://www.fiverr.com/zakiibnabbas',
    whatsapp: 'https://wa.me/message/A3HVQGAV336ZH1',
    instagram: 'https://www.instagram.com/syed_zaki_zulfiqar/',
    email: 'tafseeribnabbas@gmail.com'
  }
} as const;
