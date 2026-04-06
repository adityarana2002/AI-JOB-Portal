import AppShell from './AppShell'

const I = (d: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>

const JobSeekerLayout = () => (
  <AppShell
    title="Job Seeker Hub"
    roleLabel="Job Seeker"
    roleBadgeClass="seeker"
    navItems={[
      { label: 'Dashboard', to: '/jobseeker/dashboard', icon: I('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') },
      { label: 'Browse Jobs', to: '/jobseeker/browse', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
      { label: 'My Applications', to: '/jobseeker/applications', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    ]}
  />
)

export default JobSeekerLayout
