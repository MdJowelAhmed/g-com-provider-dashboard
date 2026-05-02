import type { Role } from '../types/role'

/** Copy + metric labels for Overview — layout stays identical; content is role-driven */
export type OverviewUiConfig = {
  /** PageHeader description under welcome title */
  subtitle: string
  /** Main analytics card title */
  chartTitle: string
  /** Left Y-axis / primary series name in tooltip */
  revenueSeriesName: string
  /** Right axis secondary series (stored as `orders` in trend data) */
  volumeSeriesName: string
  /** Summary column headers above chart */
  primaryMetricLabel: string
  secondaryMetricLabel: string
  /** Third summary metric (typically revenue/volume derived) */
  tertiaryMetricLabel: string
  /** Subtitle under status pie total */
  statusRecordsHint: string
  /** Top list card title */
  topPerformersTitle: string
  /** Subtitle under top performers title */
  topPerformersHint: string
  /** Unit line under each top item name */
  topUnitLabel: string
}

export const OVERVIEW_UI: Record<Role, OverviewUiConfig> = {
  services: {
    subtitle: "Service Provider dashboard — here's what's happening today.",
    chartTitle: 'Service revenue & volume',
    revenueSeriesName: 'Service revenue',
    volumeSeriesName: 'Requests / jobs',
    primaryMetricLabel: 'Service revenue',
    secondaryMetricLabel: 'Volume',
    tertiaryMetricLabel: 'Avg. job value',
    statusRecordsHint: 'booking & job records',
    topPerformersTitle: 'Top services',
    topPerformersHint: 'Best-performing offerings by revenue',
    topUnitLabel: 'jobs completed',
  },
  stay: {
    subtitle: 'Hotel dashboard — monitor reservations and guests.',
    chartTitle: 'Hotel revenue & room nights',
    revenueSeriesName: 'Room revenue',
    volumeSeriesName: 'Booked nights',
    primaryMetricLabel: 'Hotel revenue',
    secondaryMetricLabel: 'Room nights',
    tertiaryMetricLabel: 'ADR (avg. daily)',
    statusRecordsHint: 'reservation records',
    topPerformersTitle: 'Top rooms',
    topPerformersHint: 'Most booked room types by revenue',
    topUnitLabel: 'room nights',
  },
  dine: {
    subtitle: 'Restaurant dashboard — track orders and reservations.',
    chartTitle: 'Food revenue & covers',
    revenueSeriesName: 'Food revenue',
    volumeSeriesName: 'Orders',
    primaryMetricLabel: 'Food revenue',
    secondaryMetricLabel: 'Orders',
    tertiaryMetricLabel: 'Avg. ticket',
    statusRecordsHint: 'order records',
    topPerformersTitle: 'Top dishes',
    topPerformersHint: 'Best sellers by revenue',
    topUnitLabel: 'orders',
  },
  shops: {
    subtitle: 'Store dashboard — monitor sales and inventory.',
    chartTitle: 'Store revenue & orders',
    revenueSeriesName: 'Store revenue',
    volumeSeriesName: 'Orders',
    primaryMetricLabel: 'Store revenue',
    secondaryMetricLabel: 'Orders',
    tertiaryMetricLabel: 'Avg. order value',
    statusRecordsHint: 'order records',
    topPerformersTitle: 'Top products',
    topPerformersHint: 'Best sellers by revenue',
    topUnitLabel: 'units sold',
  },
  events: {
    subtitle: 'Events dashboard — track bookings and attendees.',
    chartTitle: 'Event revenue & ticket volume',
    revenueSeriesName: 'Event revenue',
    volumeSeriesName: 'Tickets sold',
    primaryMetricLabel: 'Event revenue',
    secondaryMetricLabel: 'Tickets',
    tertiaryMetricLabel: 'Avg. ticket price',
    statusRecordsHint: 'ticket / event records',
    topPerformersTitle: 'Top events',
    topPerformersHint: 'Highest-grossing events this period',
    topUnitLabel: 'tickets sold',
  },
}
