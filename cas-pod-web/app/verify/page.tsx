'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReadContract } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatAddress } from '@/lib/utils'
import { CONTRACTS, diplomaAbi, registryAbi } from '@/lib/contracts'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [diplomaId, setDiplomaId] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Set current URL on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin)
    }
  }, [])

  // Check for diploma ID in URL parameters with proper initialization
  useEffect(() => {
    const idFromUrl = searchParams.get('id')
    if (idFromUrl) {
      setDiplomaId(idFromUrl)
      
      // Delay auto-verification to ensure hooks are ready
      const timer = setTimeout(() => {
        handleVerify(idFromUrl)
      }, 100) // Small delay to ensure hooks are initialized
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Contract hooks for verification
  const { 
    data: diplomaData, 
    isLoading: isDiplomaLoading, 
    error: diplomaError,
    refetch: refetchDiploma 
  } = useReadContract({
    address: CONTRACTS.DIPLOMA,
    abi: diplomaAbi,
    functionName: 'verifyDiploma',
    args: diplomaId && diplomaId.length === 66 ? [diplomaId as `0x${string}`] : undefined,
    query: {
      enabled: false, // We'll trigger manually
      retry: 2,
      retryDelay: 1000,
    },
  })

  // Get university information for verified diplomas
  const { 
    data: universityData,
    isLoading: isUniversityLoading,
    refetch: refetchUniversity 
  } = useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'universities',
    args: verificationResult?.diploma?.university ? [verificationResult.diploma.university] : undefined,
    query: {
      enabled: false, // We'll trigger manually
      retry: 2,
      retryDelay: 1000,
    },
  })

  const handleVerify = async (inputDiplomaId?: string) => {
    const idToVerify = inputDiplomaId || diplomaId.trim()
    if (!idToVerify) return
    
    setIsLoading(true)
    setError(null)
    setVerificationResult(null)
    
    try {
      console.log('Verifying diploma:', idToVerify)
      
      // Validate diploma ID format
      if (!idToVerify.startsWith('0x') || idToVerify.length !== 66) {
        throw new Error('Invalid diploma ID format. Must be a 32-byte hash starting with 0x')
      }
      
      // Ensure we have a valid diploma ID set for the hooks
      if (diplomaId !== idToVerify) {
        setDiplomaId(idToVerify)
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // First, verify the diploma exists and get its data
      console.log('Fetching diploma data...')
      const diplomaResult = await refetchDiploma()
      console.log('Diploma fetch result:', diplomaResult)
      
      if (!diplomaResult?.data || !diplomaResult.data[0]) {
        setVerificationResult({
          isValid: false,
          error: 'Diploma not found. This diploma ID does not exist on the blockchain.'
        })
        return
      }

      const [isValid, diploma] = diplomaResult.data
      console.log('Diploma verification result:', { isValid, diploma })

      if (!isValid) {
        setVerificationResult({
          isValid: false,
          error: 'Invalid diploma. This diploma exists but is not valid.'
        })
        return
      }

      // Get university information
      console.log('Fetching university data...')
      const universityResult = await refetchUniversity()
      console.log('University fetch result:', universityResult)
      
      setVerificationResult({
        isValid: true,
        diploma: {
          university: diploma.university,
          student: diploma.student,
          issueDate: Number(diploma.issueDate),
          isMinted: diploma.isMinted,
          diplomaHash: diploma.diplomaHash
        },
        universityInfo: universityResult?.data ? {
          name: universityResult.data[0],
          country: universityResult.data[1],
          isApproved: universityResult.data[2],
          isRegistered: universityResult.data[3]
        } : null
      })

    } catch (error: any) {
      console.error('Verification failed:', error)
      const errorMessage = error.message || 'Failed to verify diploma. Please check the diploma ID and try again.'
      setError(errorMessage)
      setVerificationResult({
        isValid: false,
        error: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setVerificationResult(null)
    setError(null)
    setDiplomaId('')
  }

  // Handle copying verification link
  const handleCopyLink = async () => {
    try {
      const verificationUrl = `${currentUrl}/verify?id=${diplomaId}`
      await navigator.clipboard.writeText(verificationUrl)
      setCopySuccess(true)
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = `${currentUrl}/verify?id=${diplomaId}`
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (fallbackErr) {
        alert('Failed to copy link. Please copy manually.')
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verify Diploma
            </h1>
            <p className="text-gray-600">
              Enter a diploma ID to verify its authenticity on the blockchain.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Diploma Verification</CardTitle>
              <CardDescription>
                Enter the diploma ID (hash) to check if it's valid and view details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="diplomaId" className="block text-sm font-medium text-gray-700 mb-2">
                  Diploma ID
                </label>
                <Input
                  id="diplomaId"
                  type="text"
                  value={diplomaId}
                  onChange={(e) => setDiplomaId(e.target.value)}
                  placeholder="0x1234567890abcdef... (66 character hash)"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The diploma ID should be a 66-character hash starting with 0x
                </p>
              </div>
              
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVerify()} 
                  disabled={!diplomaId.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Verifying...' : 'Verify Diploma'}
                </Button>
                {verificationResult && (
                  <Button 
                    variant="outline"
                    onClick={clearResults}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {verificationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.isValid ? (
                    <>
                      ✅ Valid Diploma
                    </>
                  ) : (
                    <>
                      ❌ Invalid Diploma
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResult.isValid ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">University</h4>
                        {verificationResult.universityInfo ? (
                          <>
                            <p className="text-sm text-gray-600">{verificationResult.universityInfo.name}</p>
                            <p className="text-sm text-gray-500">{verificationResult.universityInfo.country}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {verificationResult.universityInfo.isApproved ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  ⚠ Not Approved
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Loading university information...</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatAddress(verificationResult.diploma.university)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Student</h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {formatAddress(verificationResult.diploma.student)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Issue Date</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(verificationResult.diploma.issueDate * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                          {verificationResult.diploma.isMinted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              NFT Minted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Metadata Hash</h4>
                      <p className="text-sm text-gray-600 font-mono break-all bg-gray-50 p-2 rounded">
                        {verificationResult.diploma.diplomaHash}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Diploma Verified Successfully
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              This diploma has been verified on the Arbitrum Sepolia blockchain and is authentic. 
                              It was issued by {verificationResult.universityInfo?.isApproved ? 'a verified' : 'an'} university and has not been tampered with.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share this verification */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">📤 Share Verification</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Share this verification link to allow others to instantly verify this diploma:
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={currentUrl ? `${currentUrl}/verify?id=${diplomaId}` : 'Loading...'}
                          readOnly
                          className="font-mono text-xs bg-gray-50"
                          disabled={!currentUrl}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCopyLink}
                          disabled={!currentUrl || copySuccess}
                          className={copySuccess ? 'bg-green-50 text-green-600 border-green-200' : ''}
                        >
                          {copySuccess ? '✅ Copied!' : '📋 Copy Link'}
                        </Button>
                      </div>
                      {copySuccess && (
                        <p className="text-sm text-green-600 mt-2">
                          ✅ Verification link copied to clipboard!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Verification Failed
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            {verificationResult.error || 'This diploma could not be verified. It may not exist or may have been tampered with.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* How to Verify Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Verify</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get the Diploma ID</h4>
                    <p className="text-sm text-gray-600">
                      Ask the diploma holder for their diploma ID (a unique 66-character hash starting with 0x).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enter and Verify</h4>
                    <p className="text-sm text-gray-600">
                      Paste the diploma ID in the field above and click "Verify Diploma".
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Review Results</h4>
                    <p className="text-sm text-gray-600">
                      Check the verification results including university details, issue date, and authenticity status.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">🔗 Direct Verification Links</h4>
                <p className="text-sm text-blue-700">
                  You can also create direct verification links by adding <code className="bg-blue-100 px-1 rounded">?id=DIPLOMA_ID</code> to this page's URL.
                  These links will automatically verify the diploma when opened.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 