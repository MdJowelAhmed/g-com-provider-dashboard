import { Plus } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboardRole } from '../../auth/useDashboardRole'
import { canAccessDashboardTab } from '../../modules/permissions/resolver'
import { ROLE_MOCK } from '../../data/mockData'
import PageHeader from '../../components/dashboard/PageHeader'
import DataTable from '../../components/dashboard/DataTable'
import ProductsPage from './shops/ProductsPage'
import CustomersPage from './shops/CustomersPage'
import ShopManagementPage from './shops/ShopManagementPage'
import BusinessCategoriesPage from './business-categories/BusinessCategoriesPage'
import ServicesPage from './services/ServicesPage'
import BookingsPage from './services/BookingsPage'
import ServiceCustomersPage from './services/CustomersPage'
import RoomsPage from './stay/RoomsPage'
import GuestsPage from './stay/GuestsPage'
import MenuPage from './dine/MenuPage'
import EventsPage from './events/EventsPage'
import TicketsPage from './events/TicketsPage'
import AttendeesPage from './events/AttendeesPage'
import WithdrawPage from './withdraw/WithdrawPage'
import MessagesPage from './messaging/MessagesPage'
import PostsPage from './posts/PostsPage'
import ContactSupportPage from './support/ContactSupportPage'
import SettingsPage from './settings/SettingsPage'
import NotificationsPage from './notifications/NotificationsPage'
import ControllersPage from './controllers/ControllersPage'

export default function ListPage() {
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const { tab } = useParams<{ tab: string }>()

  if (!user) return null

  if (tab === 'notifications') {
    return <NotificationsPage />
  }

  if (tab && !canAccessDashboardTab(user, tab)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />
  }

  if (tab === 'withdraw') {
    return <WithdrawPage />
  }

  if (tab === 'messages') {
    return <MessagesPage />
  }

  if (tab === 'posts') {
    return <PostsPage />
  }

  if (tab === 'support') {
    return <ContactSupportPage />
  }

  if (tab === 'settings') {
    return <SettingsPage />
  }

  if (tab === 'controllers') {
    return <ControllersPage />
  }

  if (tab === 'shop-management') {
    return <ShopManagementPage />
  }

  if (tab === 'business-categories') {
    return <BusinessCategoriesPage />
  }

  if (dashboardRole === 'services' && tab === 'services') {
    return <ServicesPage />
  }

  if (dashboardRole === 'services' && tab === 'bookings') {
    return <BookingsPage />
  }

  if (dashboardRole === 'services' && tab === 'customers') {
    return <ServiceCustomersPage />
  }

  if (dashboardRole === 'stay' && tab === 'rooms') {
    return <RoomsPage />
  }

  if (dashboardRole === 'stay' && tab === 'reservations') {
    return <BookingsPage />
  }

  if (dashboardRole === 'stay' && tab === 'guests') {
    return <GuestsPage />
  }

  if (dashboardRole === 'dine' && tab === 'menu') {
    return <MenuPage />
  }

  if (dashboardRole === 'dine' && tab === 'orders') {
    return <BookingsPage />
  }

  if (dashboardRole === 'events' && tab === 'events') {
    return <EventsPage />
  }

  if (dashboardRole === 'events' && tab === 'tickets') {
    return <TicketsPage />
  }

  if (dashboardRole === 'events' && tab === 'attendees') {
    return <AttendeesPage />
  }

  if (dashboardRole === 'shops' && tab === 'products') {
    return <ProductsPage />
  }

  if (dashboardRole === 'shops' && tab === 'orders') {
    return <BookingsPage />
  }

  if (dashboardRole === 'shops' && tab === 'customers') {
    return <CustomersPage />
  }

  const mock = ROLE_MOCK[dashboardRole]
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
