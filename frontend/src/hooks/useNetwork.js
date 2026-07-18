import { useQuery } from '@tanstack/react-query'
import { networkAPI } from '../api/network'

export const useNetwork = (filters = {}) => {
  const { data: graph, isLoading: graphLoading, refetch } = useQuery({
    queryKey: ['network-graph', filters],
    queryFn: () => networkAPI.getGraph(filters),
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['network-stats'],
    queryFn: () => networkAPI.getStats(),
  })

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: ['network-communities', filters],
    queryFn: () => networkAPI.getCommunities({ ...filters, algorithm: 'louvain' }),
  })

  return {
    graph: graph?.data || { nodes: [], edges: [] },
    stats: stats?.data || {},
    communities: communities?.data || [],
    isLoading: graphLoading || statsLoading || communitiesLoading,
    refetch,
  }
}