import { useState, useCallback, useEffect } from 'react'
import awsServiceClient from '../services/awsServiceClient'

/**
 * Custom hook for AWS Service Client
 * Provides all AWS query and service functions
 * Handles loading, error, and success states
 */
export const useAWSService = (userId) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [lastResponse, setLastResponse] = useState(null)
  const [serviceReady, setServiceReady] = useState(false)

  // Initialize service on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await awsServiceClient.initialize()
        setServiceReady(result.initialized)
        if (!result.initialized) {
          setError(result.error)
        }
      } catch (err) {
        console.error('Failed to initialize AWS service:', err)
        setServiceReady(false)
        setError(err)
      }
    }

    initialize()
  }, [])

  // Query government scheme
  const query = useCallback(
    async (queryText, language = 'en') => {
      if (!userId) {
        setError(new Error('User ID required for queries'))
        return null
      }

      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const result = await awsServiceClient.query(userId, queryText, language)
        setLastResponse(result)
        setSuccess(true)
        return result
      } catch (err) {
        setError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  // Query with automatic language detection and target language
  const queryMultilingual = useCallback(
    async (queryText, targetLanguage = 'en') => {
      if (!userId) {
        setError(new Error('User ID required for queries'))
        return null
      }

      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const result = await awsServiceClient.queryMultilingual(
          userId,
          queryText,
          targetLanguage
        )
        setLastResponse(result)
        setSuccess(true)
        return result
      } catch (err) {
        setError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  // Check service health
  const checkHealth = useCallback(async () => {
    try {
      const result = await awsServiceClient.health()
      return result
    } catch (err) {
      setError(err)
      return null
    }
  }, [])

  // Get service information
  const getServiceInfo = useCallback(async () => {
    try {
      const result = await awsServiceClient.getServiceInfo()
      return result
    } catch (err) {
      setError(err)
      return null
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear last response
  const clearResponse = useCallback(() => {
    setLastResponse(null)
  }, [])

  // Get error message for display
  const getErrorMessage = useCallback(() => {
    if (!error) return null
    return awsServiceClient.constructor.getErrorMessage(error)
  }, [error])

  return {
    // States
    loading,
    error,
    success,
    serviceReady,
    lastResponse,

    // Methods
    query,
    queryMultilingual,
    checkHealth,
    getServiceInfo,
    clearError,
    clearResponse,

    // Helpers
    getErrorMessage,
    hasError: !!error,
    hasResponse: !!lastResponse
  }
}

export default useAWSService
