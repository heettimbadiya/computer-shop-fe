import { useState, useEffect } from 'react'
import {
  getAllConfigRequests,
  updateConfigRequestStatus,
} from '../../services/api'

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
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
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
          <div className="ml-auto text-sm text-gray-600">
            Total: <span className="font-semibold">{requests.length}</span>{' '}
            requests
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request, index) => (
          <div
            key={request._id}
            className="card hover:shadow-xl transition-all duration-300 animate-slide-up cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(request.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {request.customerName && (
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-800">
                        {request.customerName}
                      </p>
                    </div>
                  )}
                  {request.customerEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-800">
                        {request.customerEmail}
                      </p>
                    </div>
                  )}
                  {request.customerPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-800">
                        {request.customerPhone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Estimated Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${request.estimatedPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(request.selectedParts)
                    .filter(([_, part]) => part)
                    .map(([category, part]) => (
                      <span
                        key={category}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {category}: {part.name}
                      </span>
                    ))}
                </div>
              </div>

              <div className="ml-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                  }}
                  className="btn-secondary text-sm whitespace-nowrap"
                >
                  View Details
                </button>
                {request.status !== 'completed' && (
                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusUpdate(request._id, e.target.value)
                    }
                    value={request.status}
                    className="input-field text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md animate-fade-in">
          <p className="text-gray-500 text-lg">No configuration requests found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filterStatus
              ? 'Try adjusting your filter'
              : 'Requests will appear here when customers submit configurations'}
          </p>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Configuration Request Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Date */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status.toUpperCase()}
                </span>
                <span className="text-gray-600">
                  Submitted: {formatDate(selectedRequest.createdAt)}
                </span>
              </div>

              {/* Customer Info */}
              {(selectedRequest.customerName ||
                selectedRequest.customerEmail ||
                selectedRequest.customerPhone) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedRequest.customerName && (
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{selectedRequest.customerName}</p>
                      </div>
                    )}
                    {selectedRequest.customerEmail && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{selectedRequest.customerEmail}</p>
                      </div>
                    )}
                    {selectedRequest.customerPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{selectedRequest.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Parts */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Selected Parts
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedRequest.selectedParts)
                    .filter(([_, part]) => part)
                    .map(([category, part]) => (
                      <div
                        key={category}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between animate-fade-in"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">{category}</p>
                          <p className="font-semibold text-gray-800">{part.name}</p>
                          {part.compatibility && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {part.compatibility.socket && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Socket: {part.compatibility.socket}
                                </span>
                              )}
                              {part.compatibility.ddrVersion && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {part.compatibility.ddrVersion}
                                </span>
                              )}
                              {part.compatibility.formFactor && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {part.compatibility.formFactor}
                                </span>
                              )}
                              {part.compatibility.wattage && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  {part.compatibility.wattage}W
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-blue-600">
                            ${part.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    Estimated Total Price
                  </span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${selectedRequest.estimatedPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-600">Update Status:</span>
                <select
                  onChange={(e) =>
                    handleStatusUpdate(selectedRequest._id, e.target.value)
                  }
                  value={selectedRequest.status}
                  className="input-field w-48"
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

