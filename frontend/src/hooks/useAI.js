import { useQuery, useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api/ai'
import toast from 'react-hot-toast'

export const useAI = () => {
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiAPI.status(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: insights, refetch: refetchInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiAPI.insights(),
    refetchInterval: 60000, // Refresh every minute
  })

  const predictCrimeMutation = useMutation({
    mutationFn: (data) => aiAPI.predictCrime(data),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to predict crime')
    },
  })

  const detectAnomaliesMutation = useMutation({
    mutationFn: (data) => aiAPI.detectAnomalies(data),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to detect anomalies')
    },
  })

  const detectMOMutation = useMutation({
    mutationFn: (data) => aiAPI.detectMO(data),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to detect MO patterns')
    },
  })

  const trainModelsMutation = useMutation({
    mutationFn: (modelType = 'all') => aiAPI.train(modelType),
    onSuccess: () => {
      toast.success('Model training started successfully')
      refetchStatus()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to train models')
    },
  })

  return {
    status: status?.data || {},
    insights: insights?.data || {},
    predictCrime: predictCrimeMutation.mutate,
    predictCrimeLoading: predictCrimeMutation.isLoading,
    detectAnomalies: detectAnomaliesMutation.mutate,
    detectAnomaliesLoading: detectAnomaliesMutation.isLoading,
    detectMO: detectMOMutation.mutate,
    detectMOLoading: detectMOMutation.isLoading,
    trainModels: trainModelsMutation.mutate,
    trainModelsLoading: trainModelsMutation.isLoading,
    refetchStatus,
    refetchInsights,
  }
}