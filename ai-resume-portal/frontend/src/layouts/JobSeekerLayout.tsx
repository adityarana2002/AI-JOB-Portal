import AppShell from './AppShell'

const JobSeekerLayout = () => (
  <AppShell
    title="Job Seeker Hub"
    roleLabel="Job Seeker"
    navItems={[
      { label: 'Dashboard', to: '/jobseeker/dashboard' },
      { label: 'Browse Jobs', to: '/jobseeker/browse' },
      { label: 'My Applications', to: '/jobseeker/applications' },
    ]}
  />
)

export default JobSeekerLayout
