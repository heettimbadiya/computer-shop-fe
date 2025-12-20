import { useState, useEffect } from 'react'
import {
  getAllConfigRequests,
  updateConfigRequestStatus,
} from '../../services/api'
import { Filter, Loader2, FileText, Calendar, User, Mail, Phone, DollarSign, Eye, X, CheckCircle2, Clock, Package } from 'lucide-react'

const ConfigRequestsManagement = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [filterStatus])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await getAllConfigRequests(filterStatus || null)
      setRequests(data)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateConfigRequestStatus(requestId, newStatus)
      await loadRequests()
      if (selectedRequest?._id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock
      case 'reviewed':
        return Eye
      case 'completed':
        return CheckCircle2
      default:
        return FileText
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="card animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary-600" />
            <label className="text-sm font-semibold text-gray-700">
              Filter by Status:
            </label>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="completed">Completed</option>
          </select>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl border border-primary-200">
            <FileText className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">
              Total: <span className="text-primary-600">{requests.length}</span> requests
            </span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request, index) => {
          const StatusIcon = getStatusIcon(request.status)
          return (
            <div
              key={request._id}
              className="card-hover animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(
                        request.status
                      )} flex items-center gap-2`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {request.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {request.customerName && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Customer</p>
                          <p className="font-semibold text-gray-900">
                            {request.customerName}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.customerEmail && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {request.customerEmail}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.customerPhone && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                          <p className="font-semibold text-gray-900">
                            {request.customerPhone}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-primary-50 to-accent-50/50 rounded-xl border border-primary-200/50">
                      <DollarSign className="w-4 h-4 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Estimated Price</p>
                        <p className="text-2xl font-bold text-primary-600">
                          ${request.estimatedPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(request.selectedParts)
                      .filter(([_, part]) => part)
                      .map(([category, part]) => (
                        <span
                          key={category}
                          className="badge-gray text-xs flex items-center gap-1"
                        >
                          <Package className="w-3 h-3" />
                          {category}: {part.name}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRequest(request)
                    }}
                    className="btn-secondary text-sm whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  {request.status !== 'completed' && (
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusUpdate(request._id, e.target.value)
                      }
                      value={request.status}
                      className="input-field text-sm cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {requests.length === 0 && (
        <div className="card text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">No configuration requests found</p>
          <p className="text-gray-500 text-sm">
            {filterStatus
              ? 'Try adjusting your filter criteria'
              : 'Requests will appear here when customers submit configurations'}
          </p>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Configuration Request Details
                </h2>
                <p className="text-sm text-gray-600">Complete request information</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Date */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                    selectedRequest.status
                  )} flex items-center gap-2`}
                >
                  {(() => {
                    const StatusIcon = getStatusIcon(selectedRequest.status)
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  {selectedRequest.status.toUpperCase()}
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Submitted: {formatDate(selectedRequest.createdAt)}</span>
                </div>
              </div>

              {/* Customer Info */}
              {(selectedRequest.customerName ||
                selectedRequest.customerEmail ||
                selectedRequest.customerPhone) && (
                <div className="card bg-gradient-to-br from-gray-50 to-primary-50/30 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedRequest.customerName && (
                      <div className="p-3 bg-white rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.customerName}</p>
                      </div>
                    )}
                    {selectedRequest.customerEmail && (
                      <div className="p-3 bg-white rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-semibold text-gray-900 text-sm truncate">{selectedRequest.customerEmail}</p>
                      </div>
                    )}
                    {selectedRequest.customerPhone && (
                      <div className="p-3 bg-white rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Parts */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  Selected Parts
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedRequest.selectedParts)
                    .filter(([_, part]) => part)
                    .map(([category, part]) => (
                      <div
                        key={category}
                        className="card bg-gray-50 border-2 border-gray-200 animate-fade-in"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{category}</p>
                            <p className="font-bold text-gray-900 mb-2">{part.name}</p>
                            {part.compatibility && (
                              <div className="flex flex-wrap gap-2">
                                {part.compatibility.socket && (
                                  <span className="badge-primary text-xs">
                                    Socket: {part.compatibility.socket}
                                  </span>
                                )}
                                {part.compatibility.ddrVersion && (
                                  <span className="badge-info text-xs">
                                    {part.compatibility.ddrVersion}
                                  </span>
                                )}
                                {part.compatibility.formFactor && (
                                  <span className="badge-success text-xs">
                                    {part.compatibility.formFactor}
                                  </span>
                                )}
                                {part.compatibility.wattage && (
                                  <span className="badge-warning text-xs">
                                    {part.compatibility.wattage}W
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                              ${part.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="card bg-gradient-to-br from-primary-50 to-accent-50/50 border-2 border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900 block">Estimated Total Price</span>
                    <span className="text-xs text-gray-600">Final price may vary</span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    ${selectedRequest.estimatedPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-1">Update Status</span>
                  <span className="text-xs text-gray-500">Change the request status</span>
                </div>
                <select
                  onChange={(e) =>
                    handleStatusUpdate(selectedRequest._id, e.target.value)
                  }
                  value={selectedRequest.status}
                  className="input-field w-48 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigRequestsManagement

