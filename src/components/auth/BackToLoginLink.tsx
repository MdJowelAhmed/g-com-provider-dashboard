import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackToLoginLink() {
  return (
    <Link
      to="/login"
      className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white"
    >
      <ArrowLeft size={16} />
      Back to log in
    </Link>
  )
}
