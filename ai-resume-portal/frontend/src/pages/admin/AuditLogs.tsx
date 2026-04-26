import { useEffect, useState, useCallback } from 'react'
import adminService from '../../services/adminService'
import type { AuditLogEntry, AuditAction, PaginatedResponse } from '../../types/admin'

const ACTION_OPTIONS: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'All Actions' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'JOB_POSTED', label: 'Job Posted' },
  { value: 'JOB_CLOSED', label: 'Job Closed' },
  { value: 'APPLICATION_SUBMITTED', label: 'Application Submitted' },
  { value: 'APPLICATION_STATUS_CHANGED', label: 'Status Changed' },
  { value: 'APPLICATION_WITHDRAWN', label: 'App Withdrawn' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_CANCELLED', label: 'Interview Cancelled' },
  { value: 'USER_STATUS_CHANGED', label: 'User Status Changed' },
]

const actionLabel = (action: AuditAction) => {
  const opt = ACTION_OPTIONS.find(o => o.value === action)
  return opt?.label ?? action.replace(/_/g, ' ')
}

const actionColor = (action: AuditAction) => {
  if (action.includes('CREATED') || action.includes('SUBMITTED')) return 'success'
  if (action.includes('REJECTED') || action.includes('CANCELLED') || action.includes('WITHDRAWN')) return 'danger'
  if (action.includes('CHANGED') || action.includes('SCHEDULED')) return 'info'
  return 'neutral'
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [search, setSearch] = useState('')

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminService.getAuditLogs(
        page, 20,
        actionFilter || undefined,
        search || undefined
      )
      setLogs(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, search])

  useEffect(() => { loadLogs() }, [loadLogs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadLogs()
  }

  if (loading && logs.length === 0) {
    return <div className="page"><div className="skeleton" style={{ height: 500, borderRadius: 20 }} /></div>
  }

  return (
    <div className="page">
      <div className="data-table-wrap">
        <div className="table-header">
          <div>
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ verticalAlign: 'text-bottom', marginRight: 8 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Audit Logs
            </h3>
            <p>Track all important system actions and events.</p>
          </div>
          <span className="badge info">{totalElements} total entries</span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, padding: '0 20px 16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ maxWidth: 220, fontSize: '0.82rem' }}
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value as AuditAction | ''); setPage(0) }}
          >
            {ACTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div className="table-search" style={{ margin: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search by actor email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </form>
        </div>

        {error && <div className="form-error" style={{ margin: '12px 20px' }}>{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem', flexShrink: 0 }}>
                      {(log.actorEmail ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.82rem' }}>{log.actorEmail ?? '—'}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${actionColor(log.action)}`} style={{ fontSize: '0.7rem' }}>
                    {actionLabel(log.action)}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {log.targetType ?? ''}{log.targetId ? ` #${log.targetId}` : ''}
                </td>
                <td style={{ fontSize: '0.78rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                  {log.detail ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && !loading && (
          <div className="empty-state" style={{ padding: 40 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.3 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3>No audit logs found</h3>
            <p>System events will appear here as actions are performed.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="button sm secondary"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="button sm secondary"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogs
