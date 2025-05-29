'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CONTRACTS, registryAbi, diplomaAbi, accessControlAbi } from '@/lib/contracts'
import { useHasUniversityRole, useUniversityInfo } from '@/hooks/useContracts'
import { formatAddress } from '@/lib/utils'
import Link from 'next/link'

export default function UniversityDashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: universityInfo, isLoading: loadingInfo, refetch: refetchInfo } = useUniversityInfo(address)
  const { data: hasUniversityRole, isLoading: loadingRole, refetch: refetchRole } = useHasUniversityRole(address)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Get the university role directly from the contract
  const { data: universityRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'UNIVERSITY_ROLE',
  })
  
  // Direct role check
  const { data: directRoleCheck, refetch: refetchDirectRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: universityRole && address ? [universityRole, address] : undefined,
    query: {
      enabled: !!universityRole && !!address,
    },
  })

  // Log role status for debugging
  useEffect(() => {
    console.log('University Info:', universityInfo)
    console.log('Has University Role:', hasUniversityRole)
    console.log('Direct Role Check:', directRoleCheck)
    console.log('University Role:', universityRole)
  }, [universityInfo, hasUniversityRole, directRoleCheck, universityRole])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        refetchInfo(),
        refetchRole(),
        refetchDirectRole()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access the university dashboard.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go Back</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isRegistered = universityInfo?.[3] // isRegistered field
  const isApproved = directRoleCheck // Use the direct role check

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">University Dashboard</h1>
          <p className="text-gray-600">
            Manage your institution and issue digital diplomas
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Connected as: {formatAddress(address)}
          </p>
        </div>

        {/* University Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>University Status</CardTitle>
                <CardDescription>
                  Your institution's registration and approval status
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing || loadingInfo || loadingRole}
              >
                {refreshing ? (
                  <>
                    <span className="animate-spin mr-1">⟳</span> 
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-1"
                    >
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
                    </svg>
                    Refresh Status
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInfo || loadingRole ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading status...</p>
              </div>
            ) : !isRegistered ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Registered</h3>
                <p className="text-gray-600 mb-6">
                  Your institution is not yet registered. Please register to start issuing diplomas.
                </p>
                <Button onClick={() => setShowRegistrationForm(true)}>
                  Register University
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">University Name</h4>
                    <p className="text-gray-600">{universityInfo?.[0] || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Country</h4>
                    <p className="text-gray-600">{universityInfo?.[1] || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Registered
                    </Badge>
                    {isApproved ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                        Pending Approval
                      </Badge>
                    )}
                    {hasUniversityRole && (
                      <Badge variant="outline" className="border-purple-300 text-purple-800">
                        University Role
                      </Badge>
                    )}
                  </div>
                </div>

                {!isApproved && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <svg className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription className="text-yellow-800">
                      <div className="font-medium mb-1">Approval Pending</div>
                      Your university registration is pending approval from an administrator. 
                      You cannot issue diplomas until approved.
                    </AlertDescription>
                  </Alert>
                )}

                {universityInfo?.[2] && !hasUniversityRole && (
                  <Alert className="border-blue-200 bg-blue-50 mt-4">
                    <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <AlertDescription className="text-blue-800">
                      <div className="font-medium mb-1">Role Assignment In Progress</div>
                      Your university has been approved in the registry, but the university role is still being assigned.
                      This process should complete shortly. Please try refreshing the page in a few moments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Only show if approved */}
        {isApproved && hasUniversityRole && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📜 Issue Diploma</CardTitle>
                  <CardDescription>
                    Issue a new diploma to a student
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Issue Single Diploma</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📚 Batch Issue</CardTitle>
                  <CardDescription>
                    Issue multiple diplomas at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Batch Issue</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Analytics</CardTitle>
                  <CardDescription>
                    View issuance statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">View Stats</Button>
                </CardContent>
              </Card>
            </div>

            {/* Issue Diploma Form */}
            <Card>
              <CardHeader>
                <CardTitle>Issue New Diploma</CardTitle>
                <CardDescription>
                  Issue a digital diploma to a student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssueDiplomaForm />
              </CardContent>
            </Card>
          </>
        )}

        {/* Registration Form */}
        {showRegistrationForm && (
          <Card>
            <CardHeader>
              <CardTitle>Register University</CardTitle>
              <CardDescription>
                Register your institution to start issuing diplomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UniversityRegistrationForm onCancel={() => setShowRegistrationForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>University Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Registration Process</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Register your university with accurate information</li>
                  <li>• Wait for administrator approval</li>
                  <li>• Once approved, you can issue diplomas</li>
                  <li>• Maintain accurate student records</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Diploma Issuance</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verify student identity before issuance</li>
                  <li>• Use accurate student wallet addresses</li>
                  <li>• Include proper metadata for diplomas</li>
                  <li>• Keep records of all issued diplomas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component for university registration form
function UniversityRegistrationForm({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')

  // Contract interaction hooks
  const { 
    writeContract: registerUniversity, 
    isPending: isRegistering,
    data: registerTxHash,
    error: registerError 
  } = useWriteContract()

  const { isLoading: isRegisterTxLoading, isSuccess: isRegisterTxSuccess } = useWaitForTransactionReceipt({
    hash: registerTxHash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !country.trim()) return

    try {
      await registerUniversity({
        address: CONTRACTS.REGISTRY,
        abi: registryAbi,
        functionName: 'registerUniversity',
        args: [name.trim(), country.trim()],
      })
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  // Close form and reset on success
  useEffect(() => {
    if (isRegisterTxSuccess) {
      setName('')
      setCountry('')
      setTimeout(() => onCancel(), 2000) // Close after showing success message
    }
  }, [isRegisterTxSuccess, onCancel])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {registerError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            Registration failed: {registerError.message || 'An error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {isRegisterTxSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            University registered successfully! Awaiting admin approval.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">University Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter university name"
          required
          disabled={isRegistering || isRegisterTxLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter country"
          required
          disabled={isRegistering || isRegisterTxLoading}
        />
      </div>
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isRegistering || isRegisterTxLoading || !name.trim() || !country.trim()}
        >
          {isRegistering || isRegisterTxLoading ? 'Registering...' : 'Register University'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isRegistering || isRegisterTxLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Component for issuing diplomas
function IssueDiplomaForm() {
  const [studentAddress, setStudentAddress] = useState('')
  const [diplomaHash, setDiplomaHash] = useState('')

  // Contract interaction hooks
  const { 
    writeContract: generateDiploma, 
    isPending: isGenerating,
    data: generateTxHash,
    error: generateError 
  } = useWriteContract()

  const { isLoading: isGenerateTxLoading, isSuccess: isGenerateTxSuccess } = useWaitForTransactionReceipt({
    hash: generateTxHash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentAddress.trim() || !diplomaHash.trim()) return

    try {
      await generateDiploma({
        address: CONTRACTS.DIPLOMA,
        abi: diplomaAbi,
        functionName: 'generateDiploma',
        args: [studentAddress.trim() as `0x${string}`, diplomaHash.trim()],
      })
    } catch (error) {
      console.error('Diploma generation failed:', error)
    }
  }

  // Reset form on success
  useEffect(() => {
    if (isGenerateTxSuccess) {
      setStudentAddress('')
      setDiplomaHash('')
    }
  }, [isGenerateTxSuccess])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {generateError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            Diploma generation failed: {generateError.message || 'An error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {isGenerateTxSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Diploma issued successfully! The student can now mint their NFT.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="studentAddress">Student Wallet Address</Label>
        <Input
          id="studentAddress"
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          placeholder="0x..."
          required
          disabled={isGenerating || isGenerateTxLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="diplomaHash">Diploma Metadata Hash</Label>
        <Input
          id="diplomaHash"
          type="text"
          value={diplomaHash}
          onChange={(e) => setDiplomaHash(e.target.value)}
          placeholder="QmExample... (IPFS hash)"
          required
          disabled={isGenerating || isGenerateTxLoading}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isGenerating || isGenerateTxLoading || !studentAddress.trim() || !diplomaHash.trim()}
      >
        {isGenerating || isGenerateTxLoading ? 'Issuing...' : 'Issue Diploma'}
      </Button>
    </form>
  )
} 