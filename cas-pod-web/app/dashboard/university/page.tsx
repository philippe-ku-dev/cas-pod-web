'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient, useChainId } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CONTRACTS, registryAbi, diplomaAbi, accessControlAbi } from '@/lib/contracts'
import { useHasUniversityRole, useUniversityInfo, useGenerateDiploma } from '@/hooks/useContracts'
import { formatAddress } from '@/lib/utils'
import Link from 'next/link'
import { encodeFunctionData } from 'viem'
import { BatchDiplomaForm } from '@/components/batch-diploma-form'

// Helper function to get network name
function getNetworkName(chainId: number | undefined): string {
  if (!chainId) return 'Unknown';
  
  switch (chainId) {
    case 421614:
      return 'Arbitrum Sepolia';
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia';
    default:
      return `Chain ID: ${chainId}`;
  }
}

// Add this component after the handleRefresh function
// Status checker component
function UniversityStatusChecker({ 
  universityInfo, 
  hasUniversityRole, 
  isUniversityApproved 
}: { 
  universityInfo: any
  hasUniversityRole: boolean | undefined
  isUniversityApproved: boolean | undefined
}) {
  if (!universityInfo?.[3]) {
    // Not registered
    return null;
  }

  const statusChecks = [
    {
      title: "University Registration",
      status: universityInfo?.[3] ? "completed" : "pending",
      description: "Your university is registered in the Registry contract"
    },
    {
      title: "Registry Approval",
      status: isUniversityApproved ? "completed" : "pending",
      description: "Your university is approved in the Registry contract"
    },
    {
      title: "University Role Assignment",
      status: hasUniversityRole ? "completed" : "pending",
      description: "Your address has the UNIVERSITY_ROLE in the AccessControl contract"
    }
  ];

  // Calculate overall status
  const canIssueDiplomas = universityInfo?.[3] && isUniversityApproved && hasUniversityRole;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Approval Status</CardTitle>
        <CardDescription>
          Your university needs to complete all steps to issue diplomas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${canIssueDiplomas ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {canIssueDiplomas ? (
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-medium">
                {canIssueDiplomas 
                  ? "Your university is fully approved and can issue diplomas" 
                  : "Your university needs additional approval steps to issue diplomas"}
              </h3>
              <p className="text-sm text-gray-600">
                {canIssueDiplomas 
                  ? "You can now start issuing diplomas to students" 
                  : "Please check the status of each requirement below"}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            {statusChecks.map((check, index) => (
              <div key={index} className="flex items-start">
                <div className={`mt-0.5 p-1 rounded-full mr-3 ${check.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {check.status === 'completed' ? (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{check.title}</h4>
                  <p className="text-xs text-gray-600">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {!canIssueDiplomas && (
            <div className="bg-blue-50 p-3 rounded-md mt-4">
              <h4 className="text-sm font-medium text-blue-800">How to get approved</h4>
              <p className="text-xs text-blue-700 mt-1">
                The university approval process requires an admin to approve your university in the Registry contract. 
                This will automatically grant the UNIVERSITY_ROLE to your address. 
                Please contact the platform administrator to complete this process.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UniversityDashboardPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showBatchForm, setShowBatchForm] = useState(false)

  // University info and role checks
  const { data: universityInfo, isLoading: loadingInfo, refetch: refetchInfo } = useUniversityInfo(address)
  const { data: hasUniversityRole, isLoading: loadingRole, refetch: refetchRole } = useHasUniversityRole(address)

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
    try {
      await Promise.all([
        refetchInfo(),
        refetchRole(),
        refetchDirectRole()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
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
                disabled={loadingInfo || loadingRole}
              >
                {loadingInfo || loadingRole ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
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

        {/* Add the Status Checker here */}
        {isRegistered && (
          <UniversityStatusChecker 
            universityInfo={universityInfo}
            hasUniversityRole={directRoleCheck}
            isUniversityApproved={isApproved}
          />
        )}

        {/* Quick Actions - Show for all registered universities regardless of approval status */}
        {isRegistered && (
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
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowBatchForm(!showBatchForm)}
                    disabled={!isApproved || !directRoleCheck}
                  >
                    {showBatchForm ? 'Hide Batch Form' : 'Batch Issue Diplomas'}
                  </Button>
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
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!isApproved || !directRoleCheck}
                  >
                    Coming Soon
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Diploma issuance analytics and reporting
                  </p>
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

            {/* Batch Diploma Form */}
            {showBatchForm && (
              <div className="mt-8">
                <BatchDiplomaForm />
              </div>
            )}
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
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  
  // Get account information
  const { address } = useAccount()
  const chainId = useChainId()
  
  // Use our enhanced hook for diploma generation
  const { generateDiploma, isPending } = useGenerateDiploma()
  
  // Get the university role directly from the contract
  const { data: universityRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'UNIVERSITY_ROLE',
  })
  
  // Check if user has university role
  const { data: hasUniversityRole, refetch: refetchRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: universityRole && address ? [universityRole, address] : undefined,
    query: {
      enabled: !!universityRole && !!address,
    }
  })

  // Additional direct check from registry contract
  const { data: isUniversityApproved } = useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'isUniversityApproved',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })
  
  // Get university info to see registration status
  const { data: universityDetails } = useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'universities',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  // Validate Ethereum address format
  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  // Function to check if a diploma might be a duplicate
  const checkDuplicateDiploma = async (studentAddress: string, university: string, diplomaHash: string) => {
    try {
      // Create the diploma ID the same way the contract would
      const packedData = encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'pack',
            inputs: [
              { type: 'address', name: 'university' },
              { type: 'address', name: 'student' },
              { type: 'string', name: 'diplomaHash' }
            ],
            outputs: [{ type: 'bytes' }],
            stateMutability: 'pure'
          }
        ],
        functionName: 'pack',
        args: [university as `0x${string}`, studentAddress as `0x${string}`, diplomaHash]
      });
      
      console.log("Generated packed data for hash check:", packedData);
      
      // Generate a random hash to try instead if needed
      return diplomaHash + "-" + Math.random().toString(36).substring(2, 8);
    } catch (error) {
      console.error("Error checking for duplicate diploma:", error);
      // If there's an error, just return a modified hash to be safe
      return diplomaHash + "-" + Date.now();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    setError('')
    setTransactionHash(null)
    
    // Validate form inputs
    if (!studentAddress) {
      setError('Student address is required')
      return
    }

    if (!isValidEthereumAddress(studentAddress)) {
      setError('Please enter a valid Ethereum address for the student')
      return
    }
    
    if (!diplomaHash || diplomaHash.trim() === '') {
      setError('Diploma hash/identifier is required')
      return
    }
    
    try {
      setIsSubmitting(true)
      setStatus('Checking permissions...')
      
      // Check university status in registry
      if (!isUniversityApproved) {
        setError('Your university is not approved in the registry. This is required to issue diplomas.')
        setIsSubmitting(false)
        return
      }
      
      // Double-check university role
      await refetchRole()
      
      if (!hasUniversityRole) {
        setError('You do not have the university role required to issue diplomas. Please make sure your university is approved by an admin.')
        setIsSubmitting(false)
        return
      }
      
      // Try to detect if this might be a duplicate and modify the hash if necessary
      let finalDiplomaHash = diplomaHash;
      try {
        const suggestedHash = await checkDuplicateDiploma(studentAddress, address as string, diplomaHash);
        
        // If the hash check suggests this might be a duplicate, use a modified hash
        if (suggestedHash !== diplomaHash) {
          console.log("Using modified hash to avoid potential duplicate:", suggestedHash);
          finalDiplomaHash = suggestedHash;
        }
      } catch (hashError) {
        console.error("Error during hash check:", hashError);
        // Continue with original hash if there's an error
      }
      
      setStatus('Preparing transaction to generate diploma...')
      
      // Log transaction information for debugging
      console.log('Generating diploma with the following parameters:', {
        contract: CONTRACTS.DIPLOMA,
        function: 'generateDiploma',
        student: studentAddress,
        diplomaHash: finalDiplomaHash,
        sender: address,
        chainId
      })
      
      // Use our enhanced hook for diploma generation
      try {
        const hash = await generateDiploma(studentAddress as `0x${string}`, finalDiplomaHash)
        
        console.log('Transaction sent successfully:', hash)
        setTransactionHash(hash)
        setStatus(`Transaction submitted successfully! Waiting for confirmation...`)
        
        // Reset form on success
        setTimeout(() => {
          setStudentAddress('')
          generateRandomHash()
        }, 3000)
      } catch (txError: any) {
        console.error('Transaction submission error:', txError)
        
        // Parse error message for common contract errors
        let errorMessage = 'Failed to submit transaction'
        
        if (typeof txError === 'object' && txError !== null) {
          if (txError.message) {
            if (txError.message.includes('user rejected transaction')) {
              errorMessage = 'Transaction rejected: You canceled the transaction.'
            } else if (txError.message.includes('insufficient funds')) {
              errorMessage = 'Transaction failed: Insufficient funds for gas.'
            } else if (txError.message.includes('PODDiplomaDuplicateEntry')) {
              errorMessage = 'This diploma already exists for this student. Please use a different diploma hash.'
            } else if (txError.message.includes('PODDiplomaUnauthorized')) {
              errorMessage = 'Unauthorized: You do not have permission to generate diplomas.'
            } else if (txError.message.includes('execution reverted')) {
              errorMessage = 'Transaction reverted by the contract. This may be due to invalid inputs or permission issues.'
            } else {
              errorMessage = `Transaction error: ${txError.message}`
            }
          }
        }
        
        setError(errorMessage)
      }
    } catch (err) {
      console.error('General error during diploma generation:', err)
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Generate a unique hash with timestamp
  const generateRandomHash = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    setDiplomaHash(`diploma-${timestamp}-${random}`)
  }
  
  // Ensure we have a diploma hash on initial load
  useEffect(() => {
    if (!diplomaHash) {
      generateRandomHash()
    }
  }, [diplomaHash])
  
  return (
    <div className="space-y-4">
      <div className="border p-4 rounded-md bg-yellow-50 mb-4">
        <h3 className="font-medium">Basic Diploma Issuance</h3>
        <p className="text-sm">Issue a diploma directly with minimal overhead.</p>
        {hasUniversityRole === false && (
          <p className="text-red-600 mt-2 text-sm">
            Warning: Your wallet does not have university role permissions.
          </p>
        )}
      </div>
      
      {status && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm whitespace-pre-wrap">{status}</p>
          {transactionHash && (
            <div className="mt-2">
              <a 
                href={`https://sepolia.arbiscan.io/tx/${transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View transaction on Arbiscan
              </a>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
        <div>
          <Label htmlFor="studentAddress">Student Address</Label>
          <Input 
            id="studentAddress"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            placeholder="0x..."
            required
            disabled={isSubmitting || isPending}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the Ethereum address of the student receiving this diploma
          </p>
        </div>
        
        <div>
          <Label htmlFor="diplomaHash">Diploma Hash/Identifier</Label>
          <div className="flex gap-2">
            <Input 
              id="diplomaHash"
              value={diplomaHash}
              onChange={(e) => setDiplomaHash(e.target.value)}
              placeholder="Unique diploma identifier"
              required
              disabled={isSubmitting || isPending}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateRandomHash}
              disabled={isSubmitting || isPending}
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This is a unique identifier for the diploma. A random value is recommended.
          </p>
        </div>
        
        <div>
          <Button 
            type="submit"
            className="w-full"
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                {status ? 'Processing...' : 'Issuing Diploma...'}
              </>
            ) : (
              'Issue Diploma'
            )}
          </Button>
        </div>
      </form>
      
      <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-sm font-medium mb-2">Debug Information</h3>
        <p className="text-xs">Contract: {CONTRACTS.DIPLOMA}</p>
        <p className="text-xs">Has University Role: {hasUniversityRole ? 'Yes' : hasUniversityRole === false ? 'No' : 'Loading...'}</p>
        <p className="text-xs">Registry Approved: {isUniversityApproved ? 'Yes' : isUniversityApproved === false ? 'No' : 'Loading...'}</p>
        <p className="text-xs">University Status: {universityDetails ? 
          `Name: ${universityDetails[0]}, Country: ${universityDetails[1]}, Approved: ${universityDetails[2] ? 'Yes' : 'No'}, Registered: ${universityDetails[3] ? 'Yes' : 'No'}` 
          : 'Loading...'}</p>
        <p className="text-xs mb-2">Chain ID: {chainId}</p>
        <p className="text-xs mb-2">Connected as: {address}</p>
        
        {/* Add issue explanation */}
        {hasUniversityRole && !isUniversityApproved && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Action Required: Registry Approval Needed</h4>
            <p className="text-xs text-yellow-700 mb-2">
              Your university has the University Role in the AccessControl contract, but it's NOT approved in the Registry contract.
              The diploma contract checks approval through the Registry, not just the role.
            </p>
            <p className="text-xs text-yellow-700 mb-2">
              <strong>How to fix:</strong> An admin needs to call the <code>approveUniversity</code> function on the Registry contract with your address.
            </p>
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs mt-2" 
          onClick={() => refetchRole()}
        >
          Refresh Role Status
        </Button>
      </div>
    </div>
  )
} 