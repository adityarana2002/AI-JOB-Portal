import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'
import EmployerLayout from '../layouts/EmployerLayout'
import JobSeekerLayout from '../layouts/JobSeekerLayout'
import AdminLayout from '../layouts/AdminLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import EmployerDashboard from '../pages/employer/Dashboard'
import PostJob from '../pages/employer/PostJob'
import MyJobs from '../pages/employer/MyJobs'
import ViewApplicants from '../pages/employer/ViewApplicants'
import JobSeekerDashboard from '../pages/jobseeker/Dashboard'
import BrowseJobs from '../pages/jobseeker/BrowseJobs'
import ApplyJob from '../pages/jobseeker/ApplyJob'
import MyApplications from '../pages/jobseeker/MyApplications'
import ScreeningResult from '../pages/jobseeker/ScreeningResult'
import AdminDashboard from '../pages/admin/Dashboard'
import UserManagement from '../pages/admin/UserManagement'
import AllJobs from '../pages/admin/AllJobs'
import AllApplicants from '../pages/admin/AllApplicants'
import ScreeningReports from '../pages/admin/ScreeningReports'
import { getHomePath } from './routeUtils'
import type { UserRole } from '../types/user'

const RequireAuth = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Checking your access...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  return <Outlet />
}

const PublicOnly = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  return <Outlet />
}

const RootRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page center">
        <div className="card">Loading...</div>
      </div>
    )
  }

  return <Navigate to={getHomePath(user?.role)} replace />
}

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />

    <Route element={<PublicOnly />}>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Route>

    <Route element={<RequireAuth allowedRoles={['EMPLOYER']} />}>
      <Route path="/employer" element={<EmployerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="my-jobs" element={<MyJobs />} />
        <Route path="jobs/:jobId/applicants" element={<ViewApplicants />} />
      </Route>
    </Route>

    <Route element={<RequireAuth allowedRoles={['JOB_SEEKER']} />}>
      <Route path="/jobseeker" element={<JobSeekerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<JobSeekerDashboard />} />
        <Route path="browse" element={<BrowseJobs />} />
        <Route path="apply/:jobId" element={<ApplyJob />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="screening/:applicationId" element={<ScreeningResult />} />
      </Route>
    </Route>

    <Route element={<RequireAuth allowedRoles={['SUPER_ADMIN']} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="jobs" element={<AllJobs />} />
        <Route path="applications" element={<AllApplicants />} />
        <Route path="screenings" element={<ScreeningReports />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default AppRouter
