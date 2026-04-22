import { Plus } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_MOCK } from '../../data/mockData'
import PageHeader from '../../components/dashboard/PageHeader'
import DataTable from '../../components/dashboard/DataTable'
import ProductsPage from './shops/ProductsPage'
import OrdersPage from './shops/OrdersPage'
import CustomersPage from './shops/CustomersPage'
import ServicesPage from './services/ServicesPage'
import BookingsPage from './services/BookingsPage'
import ServiceCustomersPage from './services/CustomersPage'
import RoomsPage from './stay/RoomsPage'
import StayBookingsPage from './stay/StayBookingsPage'
import GuestsPage from './stay/GuestsPage'
import MenuPage from './dine/MenuPage'
import DineOrdersPage from './dine/OrdersPage'
import EventsPage from './events/EventsPage'
import TicketsPage from './events/TicketsPage'
import AttendeesPage from './events/AttendeesPage'
import WithdrawPage from './withdraw/WithdrawPage'

export default function ListPage() {
  const { user } = useAuth()
  const { tab } = useParams<{ tab: string }>()

  if (!user) return null

  if (tab === 'withdraw') {
    return <WithdrawPage />
  }

  if (user.role === 'service' && tab === 'services') {
    return <ServicesPage />
  }

  if (user.role === 'service' && tab === 'bookings') {
    return <BookingsPage />
  }

  if (user.role === 'service' && tab === 'customers') {
    return <ServiceCustomersPage />
  }

  if (user.role === 'stay' && tab === 'rooms') {
    return <RoomsPage />
  }

  if (user.role === 'stay' && tab === 'bookings') {
    return <StayBookingsPage />
  }

  if (user.role === 'stay' && tab === 'guests') {
    return <GuestsPage />
  }

  if (user.role === 'dine' && tab === 'menu') {
    return <MenuPage />
  }

  if (user.role === 'dine' && tab === 'orders') {
    return <DineOrdersPage />
  }

  if (user.role === 'events' && tab === 'events') {
    return <EventsPage />
  }

  if (user.role === 'events' && tab === 'tickets') {
    return <TicketsPage />
  }

  if (user.role === 'events' && tab === 'attendees') {
    return <AttendeesPage />
  }

  if (user.role === 'shops' && tab === 'products') {
    return <ProductsPage />
  }

  if (user.role === 'shops' && tab === 'orders') {
    return <OrdersPage />
  }

  if (user.role === 'shops' && tab === 'customers') {
    return <CustomersPage />
  }

  const mock = ROLE_MOCK[user.role]
  const table = tab ? mock.tables[tab] : undefined

  if (!table) return <Navigate to={`/dashboard/${user.role}`} replace />

  return (
    <div>
      <PageHeader
        title={table.title}
        description={table.description}
        actions={
          <button
            type="button"
            className="flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            <Plus size={16} /> Add {table.title.slice(0, -1).toLowerCase()}
          </button>
        }
      />
      <DataTable columns={table.columns} rows={table.rows} />
    </div>
  )
}
