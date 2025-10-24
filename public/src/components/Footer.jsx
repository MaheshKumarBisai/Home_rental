import { Building2 } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Building2 className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              House Rental Platform
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} House Rental. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer