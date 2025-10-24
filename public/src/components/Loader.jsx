import React from 'react'

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="spinner"></div>
    </div>
  )
}

export default Loader