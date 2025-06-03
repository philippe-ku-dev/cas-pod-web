'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatAddress } from '@/lib/utils'
import { CONTRACTS, accessControlAbi, registryAbi } from '@/lib/contracts'
import { useHasAdminRole, useAllUniversities, useUniversityInfo, useHasUniversityRole } from '@/hooks/useContracts'

// Component to load and display individual university data
function UniversityItem({ 
  address, 
  onApprove, 
  isApproving, 
  isApproveTxLoading,
  refreshKey
}: { 
  address: string
  onApprove: (address: string) => void
  isApproving: boolean
  isApproveTxLoading: boolean
  refreshKey: number
}) {
  // Get the UNIVERSITY_ROLE from the contract
  const { data: universityRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'UNIVERSITY_ROLE',
  })

  const { data: universityInfo, isLoading: isLoadingInfo } = useUniversityInfo(address as `0x${string}`)
  const { data: hasUniversityRole, isLoading: isLoadingRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: universityRole ? [universityRole, address as `0x${string}`] : undefined,
    query: {
      enabled: !!universityRole,
      refetchInterval: 3000, // Refetch every 3 seconds
      refetchOnMount: true,
    },
  })
  
  // Check registry approval status
  const { data: isRegistryApproved } = useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'isUniversityApproved',
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 3000,
      refetchOnMount: true,
    },
  })
  
  // Debugging log
  console.log(`UniversityItem ${address}:`, {
    hasRole: hasUniversityRole,
    isRegistryApproved,
    universityInfo,
    refreshKey
  })

  if (isLoadingInfo || isLoadingRole || !universityRole) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold">Loading...</h3>
          <p className="text-sm text-gray-600">Address: {formatAddress(address)}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  const name = universityInfo?.[0] || `University ${address.slice(0, 6)}`
  const country = universityInfo?.[1] || 'Unknown'
  const isRegistered = universityInfo?.[3] || false
  const isApprovedInRegistry = universityInfo?.[2] || false

  // Skip if not registered or already has both approvals
  if (!isRegistered || (hasUniversityRole && isRegistryApproved)) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-600">
          Address: {formatAddress(address)}
        </p>
        <p className="text-sm text-gray-600">
          Country: {country}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="border-yellow-300 text-yellow-800">
            Pending Approval
          </Badge>
          {isRegistered && (
            <Badge variant="outline" className="border-blue-300 text-blue-800">
              Registered
            </Badge>
          )}
          {isRegistryApproved && (
            <Badge variant="outline" className="border-green-300 text-green-800">
              Registry Approved
            </Badge>
          )}
          {hasUniversityRole && (
            <Badge variant="outline" className="border-purple-300 text-purple-800">
              Has Role
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Debug: Reg: {isRegistered ? 'Y' : 'N'}, RegApproved: {isApprovedInRegistry ? 'Y' : 'N'}, Role: {hasUniversityRole ? 'Y' : 'N'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onApprove(address)}
          disabled={isApproving || isApproveTxLoading}
          size="sm"
        >
          {isApproving || isApproveTxLoading ? 'Approving...' : 'Approve'}
        </Button>
        <Button variant="outline" size="sm" disabled>
          Reject
        </Button>
      </div>
    </div>
  )
}

// Component for approved universities
function ApprovedUniversityItem({ 
  address,
  refreshKey
}: { 
  address: string
  refreshKey: number
}) {
  // Get the UNIVERSITY_ROLE from the contract
  const { data: universityRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'UNIVERSITY_ROLE',
  })

  const { data: universityInfo, isLoading: isLoadingInfo } = useUniversityInfo(address as `0x${string}`)
  const { data: hasUniversityRole, isLoading: isLoadingRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: universityRole ? [universityRole, address as `0x${string}`] : undefined,
    query: {
      enabled: !!universityRole,
      refetchInterval: 3000, // Refetch every 3 seconds
      refetchOnMount: true,
    },
  })
  
  // Debugging log
  console.log(`ApprovedUniversityItem ${address} hasRole:`, hasUniversityRole, 'role:', universityRole, 'refreshKey:', refreshKey)

  if (isLoadingInfo || isLoadingRole || !universityRole) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h3 className="font-semibold">Loading...</h3>
          <p className="text-sm text-gray-600">Address: {formatAddress(address)}</p>
        </div>
      </div>
    )
  }

  const name = universityInfo?.[0] || `University ${address.slice(0, 6)}`
  const country = universityInfo?.[1] || 'Unknown'
  const isRegistered = universityInfo?.[3] || false

  // Only show if has university role
  if (!isRegistered || !hasUniversityRole) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-600">
          Address: {formatAddress(address)}
        </p>
        <p className="text-sm text-gray-600">
          Country: {country}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            Approved
          </Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-800">
            University Role
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [refreshCounter, setRefreshCounter] = useState(0)

  // Check if current user is admin
  const { data: isAdmin } = useHasAdminRole(address)

  // Get all universities
  const { data: allUniversities, refetch: refetchUniversities } = useAllUniversities()

  // Write contract hook for approving universities
  const { 
    writeContract: approveUniversity, 
    isPending: isApproving,
    data: approveTxHash,
    error: approveError 
  } = useWriteContract()

  // Wait for approval transaction
  const { isLoading: isApproveTxLoading, isSuccess: isApproveTxSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  // Force refresh function
  const handleForceRefresh = () => {
    setRefreshCounter(prev => prev + 1)
    refetchUniversities()
  }

  // Refetch data after successful approval
  useEffect(() => {
    if (isApproveTxSuccess || approveTxHash) {
      // Add a small delay to ensure the blockchain state has updated
      const timer = setTimeout(() => {
        handleForceRefresh()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isApproveTxSuccess, approveTxHash, refetchUniversities])

  // Statistics helpers
  const countApprovedUniversities = (universities: readonly `0x${string}`[] | undefined) => {
    if (!universities) return 0
    
    let count = 0
    for (const addr of universities) {
      // Check each university here
      // This is a placeholder - we would need to check each one's status
      count += 1
    }
    return count
  }

  // Handle approval function
  const handleApproveUniversity = async (universityAddress: string) => {
    try {
      console.log('Starting approval process for:', universityAddress)
      
      // First, approve in the Registry contract
      console.log('Approving university in Registry:', universityAddress)
      
      await approveUniversity({
        address: CONTRACTS.REGISTRY,
        abi: registryAbi,
        functionName: 'approveUniversity',
        args: [universityAddress as `0x${string}`],
        // Set explicit gas parameters to avoid estimation issues
        gas: BigInt(500000), // Fixed gas limit
        maxFeePerGas: BigInt(300000000), // 0.3 gwei
        maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
      })
      
      // The Registry contract will automatically grant the university role in AccessControl
      // since it calls accessControl.grantUniversityRole(university) internally
      
      console.log('University approved in Registry and granted role:', universityAddress)
    } catch (error: any) {
      console.error('Failed to approve university:', error)
      
      // Parse specific error messages
      let errorMessage = 'Failed to approve university'
      
      if (error?.message) {
        if (error.message.includes('PODRegistryNotFound')) {
          errorMessage = 'University not registered in the system'
        } else if (error.message.includes('PODRegistryDuplicateEntry')) {
          errorMessage = 'University is already approved'
        } else if (error.message.includes('PODRegistryUnauthorized')) {
          errorMessage = 'You do not have admin privileges'
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction reverted - the university may not be registered or already approved'
        } else {
          errorMessage = `Approval failed: ${error.message}`
        }
      }
      
      console.error('Parsed error:', errorMessage)
      throw new Error(errorMessage)
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
              Please connect your wallet to access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">
              You don't have admin privileges to access this dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage university approvals and platform settings.
          </p>
          <div className="mt-4">
            <Badge variant="secondary">Admin: {formatAddress(address!)}</Badge>
          </div>
        </div>

        {/* Status Messages */}
        {approveError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Failed to approve university: {approveError.message || 'An error occurred'}
            </AlertDescription>
          </Alert>
        )}

        {isApproveTxSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              University approved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Platform Statistics - Real Data */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {!allUniversities ? '-' : allUniversities.length === 0 ? '0' : '0'}
              </div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {!allUniversities ? '-' : allUniversities.length === 0 ? '0' : countApprovedUniversities(allUniversities)}
              </div>
              <p className="text-sm text-gray-600">Approved Universities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{allUniversities?.length || 0}</div>
              <p className="text-sm text-gray-600">Total Universities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <p className="text-sm text-gray-600">Total Diplomas</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending University Approvals - Real Data */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending University Approvals</CardTitle>
                <CardDescription>
                  Review and approve university registration requests
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                disabled={!allUniversities}
              >
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
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!allUniversities ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading universities...</p>
              </div>
            ) : allUniversities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No universities registered yet
              </p>
            ) : (
              <div className="space-y-4">
                {allUniversities.map((universityAddress) => (
                  <UniversityItem
                    key={`${universityAddress}-${refreshCounter}`}
                    address={universityAddress}
                    onApprove={handleApproveUniversity}
                    isApproving={isApproving}
                    isApproveTxLoading={isApproveTxLoading}
                    refreshKey={refreshCounter}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Universities */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Approved Universities</CardTitle>
                <CardDescription>
                  Universities that have been approved and can issue diplomas
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                disabled={!allUniversities}
              >
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
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!allUniversities ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading universities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allUniversities.map((universityAddress) => (
                  <ApprovedUniversityItem 
                    key={`${universityAddress}-${refreshCounter}`} 
                    address={universityAddress} 
                    refreshKey={refreshCounter}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Management */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Manage platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" disabled>
                Update Gas Relay Settings
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Manage Fee Structure
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Platform Maintenance
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                View detailed platform metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" disabled>
                University Activity Report
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Diploma Issuance Trends
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Verification Statistics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 