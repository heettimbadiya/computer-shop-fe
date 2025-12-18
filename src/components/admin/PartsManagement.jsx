import { useState, useEffect } from 'react'
import { getParts, createPart, updatePart, deletePart } from '../../services/api'
import PartForm from './PartForm'

const CATEGORIES = [
  'CPU',
  'Motherboard',
  'RAM',
  'Storage',
  'GPU',
  'Power Supply',
  'Cabinet',
]

const PartsManagement = () => {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPart, setEditingPart] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadParts()
  }, [])

  const loadParts = async () => {
    try {
      setLoading(true)
      const data = await getParts()
      setParts(data)
    } catch (error) {
      console.error('Error loading parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPart(null)
    setShowForm(true)
  }

  const handleEdit = (part) => {
    setEditingPart(part)
    setShowForm(true)
  }

  const handleDelete = async (partId) => {
    try {
      await deletePart(partId)
      await loadParts()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting part:', error)
      alert('Failed to delete part')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPart(null)
  }

  const handleFormSuccess = () => {
    loadParts()
    handleFormClose()
  }

  const filteredParts = parts.filter((part) => {
    const matchesCategory = !filterCategory || part.category === filterCategory
    const matchesSearch =
      !searchTerm ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading parts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary whitespace-nowrap animate-scale-in"
          >
            + Add New Part
          </button>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part, index) => (
          <div
            key={part._id}
            className="card hover:scale-105 transition-transform duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {part.name}
                </h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {part.category}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${part.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stock:</span>
                <span
                  className={`font-semibold ${
                    part.stock > 10
                      ? 'text-green-600'
                      : part.stock > 0
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {part.stock} units
                </span>
              </div>
            </div>

            {part.compatibility && (
              <div className="mb-4 flex flex-wrap gap-2">
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

            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={() => handleEdit(part)}
                className="flex-1 btn-secondary text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(part._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md animate-fade-in">
          <p className="text-gray-500 text-lg">No parts found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || filterCategory
              ? 'Try adjusting your filters'
              : 'Add your first part to get started'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this part? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Part Form Modal */}
      {showForm && (
        <PartForm
          part={editingPart}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default PartsManagement

