import AppShell from './AppShell'

const I = (d: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>

const EmployerLayout = () => (
  <AppShell
    title="Employer Workspace"
    roleLabel="Employer"
    roleBadgeClass="employer"
    navItems={[
      { label: 'Dashboard', to: '/employer/dashboard', icon: I('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') },
      { label: 'Post a Job', to: '/employer/post-job', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
      { label: 'My Jobs', to: '/employer/my-jobs', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    ]}
  />
)

export default EmployerLayout
