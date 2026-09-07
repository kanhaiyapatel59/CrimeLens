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

  const extractData = (res, defaultVal = {}) => res?.data?.data || res?.data || defaultVal

  return {
    kpis: extractData(kpis, {}),
    overview: extractData(overview, {}),
    charts: extractData(charts, {}),
    districts: extractData(districts, []),
    alerts: extractData(alerts, []),
    isLoading: kpisLoading || overviewLoading || chartsLoading || districtsLoading || alertsLoading,
  }
}