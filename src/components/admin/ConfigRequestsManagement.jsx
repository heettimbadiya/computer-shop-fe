import { useState, useEffect } from 'react'
import {
  getAllConfigRequests,
  updateConfigRequestStatus,
} from '../../services/api'
import { Filter, Loader2, FileText, Calendar, User, Mail, Phone, DollarSign, Eye, X, CheckCircle2, Clock, Package, RefreshCw, Settings } from 'lucide-react'

const ConfigRequestsManagement = ({ showToast = () => {} }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    loadRequests()
    
    // Listen for new requests
    const handleNewRequest = () => {
      loadRequests()
    }
    
    window.addEventListener('configRequestSubmitted', handleNewRequest)
    return () => {
      window.removeEventListener('configRequestSubmitted', handleNewRequest)
    }
  }, [filterStatus])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await getAllConfigRequests(filterStatus || null)
      console.log('Loaded requests:', data)
      console.log('Number of requests:', data?.length || 0)
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      console.error('Error details:', error.response?.data || error.message)
      setRequests([])
      if (showToast) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load configuration requests'
        showToast(errorMessage, 'error', 5000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    if (updatingStatus === requestId) return // Prevent duplicate updates
    
    setUpdatingStatus(requestId)
    try {
      const response = await updateConfigRequestStatus(requestId, newStatus)
      
      // Update local state immediately for better UX
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      )
      
      if (selectedRequest?._id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }))
      }
      
      // Reload to get fresh data from server
      await loadRequests()
      
      showToast(
        `Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} successfully!`,
        'success'
      )
    } catch (error) {
      console.error('Error updating status:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status'
      showToast(errorMessage, 'error', 5000)
      
      // Reload to revert any optimistic updates
      await loadRequests()
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-2 border-amber-300 shadow-sm shadow-amber-200/50'
      case 'reviewed':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-300 shadow-sm shadow-blue-200/50'
      case 'completed':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-300 shadow-sm shadow-emerald-200/50'
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-2 border-gray-300 shadow-sm'
    }
  }
  
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-300/50 hover:bg-amber-500/15'
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-700 border-blue-300/50 hover:bg-blue-500/15'
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 hover:bg-emerald-500/15'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300/50'
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
    <div className="space-y-4 sm:space-y-6">
      {/* Filter */}
      <div className="card animate-slide-up">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
              <label className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                Filter by Status:
              </label>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-full sm:w-44 md:w-48 min-h-[48px] text-sm sm:text-base"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={loadRequests}
              disabled={loading}
              className="btn-secondary text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border-2 border-primary-200 shadow-sm w-full sm:w-auto sm:ml-auto">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" strokeWidth={2} />
            <span className="text-xs sm:text-sm font-bold text-gray-800">
              Total: <span className="text-primary-600 font-extrabold">{requests.length}</span> requests
            </span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3 sm:space-y-4">
        {requests.map((request, index) => {
          const StatusIcon = getStatusIcon(request.status)
          return (
            <div
              key={request._id}
              className="card-hover animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
                    <span
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold border-2 ${getStatusColor(
                        request.status
                      )} flex items-center gap-2 shadow-sm transition-all duration-200 whitespace-nowrap`}
                    >
                      <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
                      <span className="tracking-wide">{request.status.toUpperCase()}</span>
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {request.customerName && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Customer</p>
                          <p className="font-bold text-gray-900">
                            {request.customerName}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.customerEmail && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Email</p>
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {request.customerEmail}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.customerPhone && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Phone</p>
                          <p className="font-bold text-gray-900">
                            {request.customerPhone}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 via-accent-50 to-primary-50 rounded-xl border-2 border-primary-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
                        <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-0.5 uppercase tracking-wide">Estimated Price</p>
                        <p className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                          ${(request.estimatedPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(request.selectedParts || {})
                      .filter(([_, part]) => part && (typeof part === 'object' ? part.name : part))
                      .map(([category, part]) => {
                        // Handle both populated objects and ObjectIds
                        const partName = typeof part === 'object' && part !== null && 'name' in part 
                          ? part.name 
                          : typeof part === 'string' 
                          ? part 
                          : 'Unknown Part';
                        return (
                          <span
                            key={category}
                            className="badge-gray text-xs flex items-center gap-1"
                          >
                            <Package className="w-3 h-3" />
                            {category}: {partName}
                          </span>
                        );
                      })}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRequest(request)
                    }}
                    className="btn-secondary text-sm whitespace-nowrap hover:shadow-md transition-all duration-200 min-h-[44px] flex-1 sm:flex-none"
                  >
                    <Eye className="w-4 h-4" strokeWidth={2} />
                    <span>View</span>
                  </button>
                  {request.status !== 'completed' && (
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusUpdate(request._id, e.target.value)
                      }
                      value={request.status}
                      disabled={updatingStatus === request._id}
                      className={`input-field text-sm cursor-pointer font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex-1 sm:flex-none ${
                        request.status === 'pending' 
                          ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 text-amber-700 bg-amber-50/50 hover:bg-amber-50' 
                          : request.status === 'reviewed'
                          ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20 text-blue-700 bg-blue-50/50 hover:bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="pending" className="bg-white">Pending</option>
                      <option value="reviewed" className="bg-white">Reviewed</option>
                      <option value="completed" className="bg-white">Completed</option>
                    </select>
                  )}
                  {request.status === 'completed' && (
                    <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold text-center shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2 min-h-[44px] flex-1 sm:flex-none">
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                      <span>Completed</span>
                    </div>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="card max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl custom-scrollbar my-2 sm:my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-600" strokeWidth={2} />
                  Configuration Request Details
                </h2>
                <p className="text-sm text-gray-600 font-medium">Complete request information</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-10 h-10 rounded-xl hover:bg-red-50 flex items-center justify-center transition-all duration-200 text-gray-500 hover:text-red-600 border-2 border-transparent hover:border-red-200"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Date */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <span
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 ${getStatusColor(
                    selectedRequest.status
                  )} flex items-center gap-2 shadow-md transition-all duration-200`}
                >
                  {(() => {
                    const StatusIcon = getStatusIcon(selectedRequest.status)
                    return <StatusIcon className="w-4 h-4" strokeWidth={2.5} />
                  })()}
                  <span className="tracking-wide">{selectedRequest.status.toUpperCase()}</span>
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
                <div className="card bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20 border-2 border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" strokeWidth={2} />
                    </div>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {selectedRequest.customerName && (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Name</p>
                        <p className="font-bold text-gray-900 text-lg">{selectedRequest.customerName}</p>
                      </div>
                    )}
                    {selectedRequest.customerEmail && (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email</p>
                        <p className="font-bold text-gray-900 text-sm truncate">{selectedRequest.customerEmail}</p>
                      </div>
                    )}
                    {selectedRequest.customerPhone && (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone</p>
                        <p className="font-bold text-gray-900 text-lg">{selectedRequest.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Parts */}
              <div>
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600" strokeWidth={2} />
                  </div>
                  Selected Parts
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedRequest.selectedParts || {})
                    .filter(([_, part]) => part)
                    .map(([category, part]) => {
                      // Handle both populated objects and ObjectIds
                      if (!part || (typeof part === 'object' && !part.name)) {
                        return (
                          <div
                            key={category}
                            className="card bg-gray-50 border-2 border-gray-200 animate-fade-in"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{category}</p>
                                <p className="font-bold text-gray-900 mb-2">Part ID: {typeof part === 'object' ? part._id || part : part}</p>
                                <p className="text-sm text-gray-500">Part details not available</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div
                          key={category}
                          className="card bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 animate-fade-in hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{category}</p>
                              <p className="font-bold text-gray-900 mb-3 text-lg">{part.name || 'Unknown Part'}</p>
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
                              <p className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                ${(part.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Total Price */}
              <div className="card bg-gradient-to-br from-primary-50 via-accent-50 to-primary-50 border-2 border-primary-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900 block mb-1">Estimated Total Price</span>
                    <span className="text-xs text-gray-600 font-medium">Final price may vary based on availability</span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                      ${(selectedRequest.estimatedPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex flex-col gap-3 sm:gap-4 pt-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-transparent -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 rounded-b-2xl">
                <div>
                  <span className="text-sm font-bold text-gray-900 block mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary-600" strokeWidth={2} />
                    Update Status
                  </span>
                  <span className="text-xs text-gray-600">Change the request status</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    onChange={(e) =>
                      handleStatusUpdate(selectedRequest._id, e.target.value)
                    }
                    value={selectedRequest.status}
                    disabled={updatingStatus === selectedRequest._id}
                    className={`input-field w-full sm:w-56 cursor-pointer font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] ${
                      selectedRequest.status === 'pending' 
                        ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20 text-amber-700 bg-amber-50/50 hover:bg-amber-50' 
                        : selectedRequest.status === 'reviewed'
                        ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20 text-blue-700 bg-blue-50/50 hover:bg-blue-50'
                        : selectedRequest.status === 'completed'
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="pending" className="bg-white">Pending</option>
                    <option value="reviewed" className="bg-white">Reviewed</option>
                    <option value="completed" className="bg-white">Completed</option>
                  </select>
                  {updatingStatus === selectedRequest._id && (
                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin shrink-0 self-center sm:self-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigRequestsManagement

