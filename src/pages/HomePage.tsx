import { Link } from "@tanstack/react-router"

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900">Job Tracker</h1>
      <p className="mt-4 text-gray-600">init</p>
      <nav className="mt-6 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <Link to="/my-applications" className="text-blue-600 hover:underline">
          My Applications
        </Link>
      </nav>
    </div>
  )
}

export default HomePage