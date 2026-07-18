import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboard'

export const useDashboard = (filters = {}) => {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => dashboardAPI.getKPIs(filters),
  })

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview', filters],
    queryFn: () => dashboardAPI.getOverview(filters),
  })

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts', filters],
    queryFn: () => dashboardAPI.getCharts({ ...filters, groupBy: 'crimeType', limit: 8 }),
  })

  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ['dashboard-districts', filters],
    queryFn: () => dashboardAPI.getDistricts({ ...filters }),
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard-alerts', filters],
    queryFn: () => dashboardAPI.getAlerts({ ...filters }),
    refetchInterval: 60000, // Refresh every minute
  })

  return {
    kpis: kpis?.data || {},
    overview: overview?.data || {},
    charts: charts?.data || {},
    districts: districts?.data || [],
    alerts: alerts?.data || [],
    isLoading: kpisLoading || overviewLoading || chartsLoading || districtsLoading || alertsLoading,
  }
}