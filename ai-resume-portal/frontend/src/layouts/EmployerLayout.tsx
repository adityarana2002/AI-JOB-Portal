import AppShell from './AppShell'

const EmployerLayout = () => (
  <AppShell
    title="Employer Workspace"
    roleLabel="Employer"
    navItems={[
      { label: 'Dashboard', to: '/employer/dashboard' },
      { label: 'Post a Job', to: '/employer/post-job' },
      { label: 'My Jobs', to: '/employer/my-jobs' },
    ]}
  />
)

export default EmployerLayout
