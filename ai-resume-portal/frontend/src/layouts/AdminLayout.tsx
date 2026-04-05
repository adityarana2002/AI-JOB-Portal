import AppShell from './AppShell'

const AdminLayout = () => (
  <AppShell
    title="Super Admin"
    roleLabel="Super Admin"
    navItems={[
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Jobs', to: '/admin/jobs' },
    ]}
  />
)

export default AdminLayout
