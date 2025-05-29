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
import { useHasAdminRole, useAllUniversities, useUniversityInfo } from '@/hooks/useContracts'

interface UniversityData {
  address: string
  name: string
  country: string
  isApproved: boolean
  isRegistered: boolean
}

// Component to load and display individual university data
function UniversityItem({ 
  address, 
  onApprove, 
  isApproving, 
  isApproveTxLoading 
}: { 
  address: string
  onApprove: (address: string) => void
  isApproving: boolean
  isApproveTxLoading: boolean
}) {
  const { data: universityInfo, isLoading } = useUniversityInfo(address as `0x${string}`)

  if (isLoading) {
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
  const isApproved = universityInfo?.[2] || false
  const isRegistered = universityInfo?.[3] || false

  // Only show if registered but not approved (pending)
  if (!isRegistered || isApproved) {
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
        </div>
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
function ApprovedUniversityItem({ address }: { address: string }) {
  const { data: universityInfo, isLoading } = useUniversityInfo(address as `0x${string}`)

  if (isLoading) {
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
  const isApproved = universityInfo?.[2] || false

  // Only show if approved
  if (!isApproved) {
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
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()

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

  // Refetch data after successful approval
  useEffect(() => {
    if (isApproveTxSuccess) {
      refetchUniversities()
    }
  }, [isApproveTxSuccess, refetchUniversities])

  const handleApproveUniversity = async (universityAddress: string) => {
    try {
      await approveUniversity({
        address: CONTRACTS.ACCESS_CONTROL,
        abi: accessControlAbi,
        functionName: 'grantUniversityRole',
        args: [universityAddress as `0x${string}`],
      })
    } catch (error) {
      console.error('Failed to approve university:', error)
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
              <div className="text-2xl font-bold text-blue-600">-</div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">-</div>
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
            <CardTitle>Pending University Approvals</CardTitle>
            <CardDescription>
              Review and approve university registration requests
            </CardDescription>
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
                    key={universityAddress}
                    address={universityAddress}
                    onApprove={handleApproveUniversity}
                    isApproving={isApproving}
                    isApproveTxLoading={isApproveTxLoading}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Universities */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Approved Universities</CardTitle>
            <CardDescription>
              Universities that have been approved and can issue diplomas
            </CardDescription>
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
                  <ApprovedUniversityItem key={universityAddress} address={universityAddress} />
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