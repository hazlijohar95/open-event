import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Users,
  UserPlus,
  ShieldCheck,
  MagnifyingGlass,
  DotsThree,
  Trash,
  CheckCircle,
  XCircle,
  Warning,
  EnvelopeSimple,
  X,
  UserCircle,
  Crown,
} from '@phosphor-icons/react'

type UserStatus = 'active' | 'suspended' | 'pending'
type UserRole = 'admin' | 'organizer' | 'superadmin'

const statusColors: Record<UserStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Active' },
  suspended: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Suspended' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
}

const roleColors: Record<UserRole, { bg: string; text: string; icon: typeof ShieldCheck }> = {
  superadmin: { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Crown },
  admin: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: ShieldCheck },
  organizer: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: UserCircle },
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'organizer'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Id<'users'> | null>(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [actionReason, setActionReason] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<Id<'users'> | null>(null)

  const currentUser = useQuery(api.queries.auth.getCurrentUser)
  const isSuperadmin = currentUser?.role === 'superadmin'

  // Use different query based on what we want to show
  const users = useQuery(
    api.admin.listAllUsers,
    roleFilter === 'all'
      ? { status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }
      : { role: roleFilter, status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }
  )

  const admins = useQuery(api.admin.listAdmins)

  const createAdmin = useMutation(api.admin.createAdmin)
  const removeAdmin = useMutation(api.admin.removeAdmin)
  const suspendUser = useMutation(api.moderation.suspendUser)
  const unsuspendUser = useMutation(api.moderation.unsuspendUser)

  const filteredUsers = users?.filter((u) => {
    if (!searchQuery.trim()) return true
    const search = searchQuery.toLowerCase()
    return (
      u.name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    )
  })

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      await createAdmin({ email: newAdminEmail.trim(), name: newAdminName.trim() })
      toast.success('Admin created successfully')
      setShowCreateModal(false)
      setNewAdminName('')
      setNewAdminEmail('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create admin')
    }
  }

  const handleRemoveAdmin = async () => {
    if (!selectedUser) return

    try {
      await removeAdmin({ adminId: selectedUser, reason: actionReason || undefined })
      toast.success('Admin role removed')
      setShowRemoveModal(false)
      setSelectedUser(null)
      setActionReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove admin')
    }
  }

  const handleSuspendUser = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    try {
      await suspendUser({ userId: selectedUser, reason: actionReason })
      toast.success('User suspended')
      setShowSuspendModal(false)
      setSelectedUser(null)
      setActionReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to suspend user')
    }
  }

  const handleUnsuspendUser = async () => {
    if (!selectedUser) return

    try {
      await unsuspendUser({ userId: selectedUser, reason: actionReason || undefined })
      toast.success('User unsuspended')
      setShowUnsuspendModal(false)
      setSelectedUser(null)
      setActionReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unsuspend user')
    }
  }

  const openSuspendModal = (userId: Id<'users'>, userName: string) => {
    setSelectedUser(userId)
    setSelectedUserName(userName)
    setActionReason('')
    setShowSuspendModal(true)
    setActiveDropdown(null)
  }

  const openUnsuspendModal = (userId: Id<'users'>, userName: string) => {
    setSelectedUser(userId)
    setSelectedUserName(userName)
    setActionReason('')
    setShowUnsuspendModal(true)
    setActiveDropdown(null)
  }

  const openRemoveAdminModal = (userId: Id<'users'>, userName: string) => {
    setSelectedUser(userId)
    setSelectedUserName(userName)
    setActionReason('')
    setShowRemoveModal(true)
    setActiveDropdown(null)
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const adminCount = admins?.length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, admins, and account statuses
          </p>
        </div>
        {isSuperadmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-amber-500 text-white font-medium text-sm',
              'hover:bg-amber-600 transition-colors'
            )}
          >
            <UserPlus size={18} weight="bold" />
            Add Admin
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Users size={24} weight="duotone" className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users?.length || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="p-3 rounded-lg bg-amber-500/10">
            <ShieldCheck size={24} weight="duotone" className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold">{adminCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="p-3 rounded-lg bg-red-500/10">
            <Warning size={24} weight="duotone" className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold">
              {users?.filter((u) => u.status === 'suspended').length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-2">
          {(['all', 'admin', 'organizer'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                roleFilter === role
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'active', 'suspended', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                statusFilter === status
                  ? status === 'suspended'
                    ? 'border-red-500 bg-red-500/10 text-red-600'
                    : status === 'pending'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                    : 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {!users ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : filteredUsers?.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers?.map((user) => {
                  const status = statusColors[user.status as UserStatus] || statusColors.active
                  const role = roleColors[user.role as UserRole] || roleColors.organizer
                  const RoleIcon = role.icon
                  const isCurrentUser = user._id === currentUser?._id
                  const canModerate =
                    !isCurrentUser &&
                    user.role !== 'superadmin' &&
                    (isSuperadmin || user.role !== 'admin')

                  return (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <UserCircle size={24} weight="duotone" className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.name || 'Unnamed'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                            role.bg,
                            role.text
                          )}
                        >
                          <RoleIcon size={14} weight="duotone" />
                          {user.role || 'organizer'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full',
                            status.bg,
                            status.text
                          )}
                        >
                          {status.label}
                        </span>
                        {user.status === 'suspended' && user.suspendedReason && (
                          <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                            {user.suspendedReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canModerate && (
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActiveDropdown(activeDropdown === user._id ? null : user._id)
                              }
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <DotsThree size={20} weight="bold" />
                            </button>

                            {activeDropdown === user._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 w-48 py-1 rounded-lg border border-border bg-background shadow-lg">
                                  {user.status === 'suspended' ? (
                                    <button
                                      onClick={() =>
                                        openUnsuspendModal(user._id, user.name || 'this user')
                                      }
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-green-600"
                                    >
                                      <CheckCircle size={16} weight="duotone" />
                                      Unsuspend User
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        openSuspendModal(user._id, user.name || 'this user')
                                      }
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-red-600"
                                    >
                                      <XCircle size={16} weight="duotone" />
                                      Suspend User
                                    </button>
                                  )}

                                  {isSuperadmin && user.role === 'admin' && (
                                    <button
                                      onClick={() =>
                                        openRemoveAdminModal(user._id, user.name || 'this user')
                                      }
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors text-red-600"
                                    >
                                      <Trash size={16} weight="duotone" />
                                      Remove Admin Role
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <UserPlus size={20} weight="duotone" className="text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold">Add New Admin</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Enter admin's full name"
                  className={cn(
                    'w-full px-3 py-2.5 rounded-lg border border-border bg-background',
                    'text-sm placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple
                    size={18}
                    weight="duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background',
                      'text-sm placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20'
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  If the user exists, they will be upgraded to admin. Otherwise, a new account will
                  be created.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={!newAdminName.trim() || !newAdminEmail.trim()}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-amber-500 text-white hover:bg-amber-600 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Admin Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRemoveModal(false)} />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Trash size={20} weight="duotone" className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold">Remove Admin Role</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to remove admin privileges from <strong>{selectedUserName}</strong>?
              They will be downgraded to organizer role.
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background',
                'text-sm placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAdmin}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuspendModal(false)} />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle size={20} weight="duotone" className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold">Suspend User</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to suspend <strong>{selectedUserName}</strong>? They will not be
              able to access the platform.
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason for suspension (required)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background',
                'text-sm placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                disabled={!actionReason.trim()}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-red-500 text-white hover:bg-red-600 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsuspend User Modal */}
      {showUnsuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowUnsuspendModal(false)}
          />
          <div className="relative bg-background rounded-xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle size={20} weight="duotone" className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Unsuspend User</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to unsuspend <strong>{selectedUserName}</strong>? They will
              regain access to the platform.
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background',
                'text-sm placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowUnsuspendModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnsuspendUser}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Unsuspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
