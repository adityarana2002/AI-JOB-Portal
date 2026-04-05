import AppShell from './AppShell'

const AdminLayout = () => (
  <AppShell
    title="Super Admin"
    roleLabel="Super Admin"
    navItems={[
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Users', to: '/admin/users' },
      { label: 'All Jobs', to: '/admin/jobs' },
      { label: 'Applications', to: '/admin/applications' },
      { label: 'Screening Reports', to: '/admin/screenings' },
    ]}
  />
)

export default AdminLayout
