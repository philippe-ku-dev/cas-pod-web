'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAddress } from '@/lib/utils'

export default function VerifyPage() {
  const [diplomaId, setDiplomaId] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    if (!diplomaId.trim()) return
    
    setIsLoading(true)
    try {
      // TODO: Implement actual verification logic with smart contract
      // For now, showing mock data
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setVerificationResult({
        isValid: true,
        diploma: {
          university: '0x1234567890123456789012345678901234567890',
          student: '0x0987654321098765432109876543210987654321',
          issueDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
          isMinted: true,
          diplomaHash: 'QmExampleHashForDiplomaMetadata123456789'
        },
        universityInfo: {
          name: 'Example University',
          country: 'United States',
          isApproved: true
        }
      })
    } catch (error) {
      console.error('Verification failed:', error)
      setVerificationResult({
        isValid: false,
        error: 'Failed to verify diploma'
      })
    } finally {
      setIsLoading(false)
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
                <input
                  id="diplomaId"
                  type="text"
                  value={diplomaId}
                  onChange={(e) => setDiplomaId(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button 
                onClick={handleVerify} 
                disabled={!diplomaId.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify Diploma'}
              </Button>
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
                        <p className="text-sm text-gray-600">{verificationResult.universityInfo.name}</p>
                        <p className="text-sm text-gray-500">{verificationResult.universityInfo.country}</p>
                        <p className="text-xs text-gray-400">
                          {formatAddress(verificationResult.diploma.university)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Student</h4>
                        <p className="text-sm text-gray-600">
                          {formatAddress(verificationResult.diploma.student)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Issue Date</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(verificationResult.diploma.issueDate * 1000).toLocaleDateString()}
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
                      <p className="text-sm text-gray-600 font-mono break-all">
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
                              This diploma has been verified on the blockchain and is authentic. 
                              It was issued by a verified university and has not been tampered with.
                            </p>
                          </div>
                        </div>
                      </div>
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
                      Ask the diploma holder for their diploma ID (a unique hash starting with 0x).
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 