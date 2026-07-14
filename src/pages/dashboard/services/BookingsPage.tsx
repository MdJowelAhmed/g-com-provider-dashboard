import { useMemo, useState } from 'react'
import { message } from 'antd'
import { Eye, Loader2, Star } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import {
  useBookingCompletedMutation,
  useBookingDeliveredMutation,
  useBookingShippedMutation,
  useGetProviderOrdersQuery,
} from '../../../redux/api/myBookingApi'
import { BUSINESS_MAIN_CATEGORIES } from '../../../types/businessCategory'
import PageHeader from '../../../components/dashboard/PageHeader'
import SearchField from '../../../components/common/SearchField'
import { useSearchField } from '../../../hooks/useSearchField'
import CompleteOrderModal from './CompleteOrderModal'
import DeliverOrderModal from './DeliverOrderModal'
import ProviderOrderDrawer from './ProviderOrderDrawer'
import {
  categoryFromProfile,
  formatDateTime,
  formatMoney,
  mapProviderOrdersFromApi,
  ORDER_STATUS_OPTIONS,
  pageCopyForCategory,
  paymentStatusLabel,
  statusLabel,
  type ProviderOrder,
} from './providerOrderTypes'

const allFilter = '__all__'

const statusTone: Record<string, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  payment_created: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-accent-success/15 text-accent-success',
  confirmed: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-accent-success/15 text-accent-success',
  cancelled: 'bg-accent-danger/15 text-accent-danger',
}

const paymentTone: Record<string, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  paid: 'bg-accent-success/15 text-accent-success',
  failed: 'bg-accent-danger/15 text-accent-danger',
  refunded: 'bg-gray-500/20 text-gray-300',
}

export default function BookingsPage() {
  const { user } = useAuth()
  const category = categoryFromProfile(user?.extra?.category)
  const copy = pageCopyForCategory(category)

  const { inputValue, setInputValue, searchTerm, clear, flush, isDebouncing } = useSearchField({
    minChars: 2,
  })
  const [statusFilter, setStatusFilter] = useState<string>(allFilter)
  const [openId, setOpenId] = useState<string | null>(null)
  const [deliverOrder, setDeliverOrder] = useState<ProviderOrder | null>(null)
  const [completeOrder, setCompleteOrder] = useState<ProviderOrder | null>(null)
  const [actionBusyId, setActionBusyId] = useState<string | null>(null)
  const [actionBusyType, setActionBusyType] = useState<'ship' | 'deliver' | 'complete' | null>(null)

  const { data, isLoading, isFetching, isError } = useGetProviderOrdersQuery({
    page: 1,
    limit: 50,
    ...(searchTerm ? { searchTerm } : {}),
    ...(statusFilter !== allFilter ? { status: statusFilter } : {}),
  })
  const [shipBooking] = useBookingShippedMutation()
  const [deliverBooking] = useBookingDeliveredMutation()
  const [completeBooking] = useBookingCompletedMutation()

  const orders = useMemo(
    () =>
      mapProviderOrdersFromApi(data?.data ?? [], category).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data?.data, category],
  )

  const selected = openId ? orders.find((order) => order.id === openId) ?? null : null

  const runAction = async (
    orderId: string,
    type: 'ship' | 'deliver' | 'complete',
    task: () => Promise<{ message?: string }>,
    onSuccess?: () => void,
  ) => {
    if (actionBusyId) return
    setActionBusyId(orderId)
    setActionBusyType(type)
    try {
      const result = await task()
      message.success(result.message || `Order ${type} updated`)
      onSuccess?.()
    } catch (error) {
      const text =
        error && typeof error === 'object' && 'data' in error
          ? ((error as { data?: { message?: string } }).data?.message ?? `Failed to ${type} order`)
          : `Failed to ${type} order`
      message.error(text)
    } finally {
      setActionBusyId(null)
      setActionBusyType(null)
    }
  }

  const handleShip = (order: ProviderOrder) =>
    runAction(order.id, 'ship', async () => shipBooking({ id: order.id }).unwrap())

  const handleDeliver = (order: ProviderOrder) => {
    setDeliverOrder(order)
  }

  const handleComplete = (order: ProviderOrder) => {
    setCompleteOrder(order)
  }

  const submitDeliver = async (deliveryProof: string) => {
    if (!deliverOrder) return
    await runAction(
      deliverOrder.id,
      'deliver',
      async () => deliverBooking({ id: deliverOrder.id, deliveryProof }).unwrap(),
      () => setDeliverOrder(null),
    )
  }

  const submitComplete = async (reason: string) => {
    if (!completeOrder) return
    await runAction(
      completeOrder.id,
      'complete',
      async () => completeBooking({ id: completeOrder.id, reason }).unwrap(),
      () => setCompleteOrder(null),
    )
  }

  return (
    <div>
      <PageHeader title={copy.title} description={copy.description} />

 
    
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField
          value={inputValue}
          onChange={setInputValue}
          onClear={clear}
          onFlush={flush}
          minChars={2}
          loading={isDebouncing || ((isLoading || isFetching) && Boolean(searchTerm))}
          placeholder={copy.searchPlaceholder}
          aria-label="Search bookings"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-surface-border bg-surface-card px-3 text-sm text-gray-100 focus:border-brand focus:outline-none"
        >
          <option value={allFilter}>All statuses</option>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Loading {copy.title.toLowerCase()}…
          </div>
        ) : isError ? (
          <div className="px-4 py-16 text-center text-sm text-accent-danger">
            Failed to load {copy.title.toLowerCase()}. Please refresh and try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">{copy.itemColumn}</th>
                  <th className="px-4 py-3 font-medium">{copy.scheduleColumn}</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                      {copy.emptyLabel}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      category={category}
                      onOpen={() => setOpenId(order.id)}
                      onShip={handleShip}
                      onDeliver={handleDeliver}
                      onComplete={handleComplete}
                      busyId={actionBusyId}
                      busyType={actionBusyType}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProviderOrderDrawer
        open={openId !== null}
        order={selected}
        onClose={() => setOpenId(null)}
        onShip={selected ? () => handleShip(selected) : undefined}
        onDeliver={selected ? () => handleDeliver(selected) : undefined}
        onComplete={selected ? () => handleComplete(selected) : undefined}
        busy={selected ? actionBusyId === selected.id : false}
        busyType={actionBusyType}
      />

      <DeliverOrderModal
        open={deliverOrder !== null}
        order={deliverOrder}
        submitting={deliverOrder ? actionBusyId === deliverOrder.id && actionBusyType === 'deliver' : false}
        onClose={() => setDeliverOrder(null)}
        onSubmit={submitDeliver}
      />

      <CompleteOrderModal
        open={completeOrder !== null}
        order={completeOrder}
        submitting={completeOrder ? actionBusyId === completeOrder.id && actionBusyType === 'complete' : false}
        onClose={() => setCompleteOrder(null)}
        onSubmit={submitComplete}
      />
    </div>
  )
}

function OrderRow({
  order,
  category,
  onOpen,
  onShip,
  onDeliver,
  onComplete,
  busyId,
  busyType,
}: {
  order: ProviderOrder
  category: ReturnType<typeof categoryFromProfile>
  onOpen: () => void
  onShip: (order: ProviderOrder) => void
  onDeliver: (order: ProviderOrder) => void
  onComplete: (order: ProviderOrder) => void
  busyId: string | null
  busyType: 'ship' | 'deliver' | 'complete' | null
}) {
  const scheduleText = getScheduleText(order, category)
  const isBusy = busyId === order.id
  const canShipDeliver =
    category === BUSINESS_MAIN_CATEGORIES.SHOP || category === BUSINESS_MAIN_CATEGORIES.DINE
  const canComplete = category === BUSINESS_MAIN_CATEGORIES.SERVICES

  return (
    <tr
      className="cursor-pointer border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="font-mono text-xs text-gray-300">{order.orderId}</div>
        <div className="mt-0.5 text-[11px] capitalize text-gray-500">{order.orderType}</div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-100">{order.customer.name}</div>
        <div className="text-xs text-gray-500">{order.customer.email}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-200">{order.summaryLabel}</div>
        {order.stayDetails ? (
          <div className="text-xs text-gray-500">Room #{order.stayDetails.roomNumber}</div>
        ) : order.productLines.length > 1 ? (
          <div className="text-xs text-gray-500">{order.productLines.length} items</div>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-200">{scheduleText}</div>
        {order.summaryMeta ? (
          <div className="text-xs text-gray-500">{order.summaryMeta}</div>
        ) : null}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="font-medium text-gray-100">{formatMoney(order.totalAmount)}</div>
        {order.providerAmount > 0 ? (
          <div className="text-xs text-gray-500">you get {formatMoney(order.providerAmount)}</div>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            statusTone[order.status] ?? 'bg-gray-500/20 text-gray-300'
          }`}
        >
          {statusLabel(order.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            paymentTone[order.paymentStatus] ?? 'bg-gray-500/20 text-gray-300'
          }`}
        >
          {paymentStatusLabel(order.paymentStatus)}
        </span>
      </td>
      <td className="px-4 py-3">
        {order.review ? (
          <span className="inline-flex items-center gap-1 text-gray-200">
            <Star size={13} className="fill-accent-amber text-accent-amber" />
            <span className="text-sm font-medium">{order.review.rating.toFixed(1)}</span>
          </span>
        ) : order.hasReview ? (
          <span className="text-xs text-gray-500">Reviewed</span>
        ) : order.status === 'completed' || order.paymentStatus === 'paid' ? (
          <span className="text-xs text-gray-500">Awaiting</span>
        ) : (
          <span className="text-gray-600">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {canShipDeliver ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onShip(order)
                }}
                disabled={isBusy}
                className="rounded-md border border-surface-border px-2 py-1 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
              >
                {isBusy && busyType === 'ship' ? 'Shipping...' : 'Ship'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeliver(order)
                }}
                disabled={isBusy}
                className="rounded-md border border-surface-border px-2 py-1 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
              >
                {isBusy && busyType === 'deliver' ? 'Delivering...' : 'Deliver'}
              </button>
            </>
          ) : null}
          {canComplete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onComplete(order)
              }}
              disabled={isBusy}
              className="rounded-md border border-surface-border px-2 py-1 text-xs text-gray-200 hover:bg-surface-elevated disabled:opacity-60"
            >
              {isBusy && busyType === 'complete' ? 'Completing...' : 'Complete'}
            </button>
          ) : null}
          <button
            type="button"
            title="View details"
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-300 hover:border-surface-border hover:bg-surface-card hover:text-white"
          >
            <Eye size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function getScheduleText(
  order: ProviderOrder,
  category: ReturnType<typeof categoryFromProfile>,
) {
  if (category === BUSINESS_MAIN_CATEGORIES.STAY && order.stayDetails) {
    return `${formatDateTime(order.stayDetails.checkIn).split(',')[0]} → ${formatDateTime(order.stayDetails.checkOut).split(',')[0]}`
  }
  if (
    (category === BUSINESS_MAIN_CATEGORIES.SHOP || category === BUSINESS_MAIN_CATEGORIES.DINE) &&
    order.fulfillment
  ) {
    return order.fulfillment.method
  }
  if (category === BUSINESS_MAIN_CATEGORIES.SERVICES && order.serviceDetails?.startTime) {
    return formatDateTime(order.serviceDetails.startTime)
  }
  if (category === BUSINESS_MAIN_CATEGORIES.EVENT && order.eventDetails?.eventDate) {
    return formatDateTime(order.eventDetails.eventDate)
  }
  return formatDateTime(order.createdAt)
}

