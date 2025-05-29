'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatAddress, parseWagmiError } from '@/lib/utils'
import { CONTRACTS, accessControlAbi } from '@/lib/contracts'
import { useHasAdminRole, useAllUniversities } from '@/hooks/useContracts'

interface UniversityProfile {
  name: string
  metadataURI: string
  isVerified: boolean
  profileCID: string
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [pendingUniversities, setPendingUniversities] = useState<string[]>([])
  const [universityProfiles, setUniversityProfiles] = useState<Record<string, UniversityProfile>>({})

  // Check if current user is admin
  const { data: isAdmin } = useHasAdminRole(address)

  // Get all universities
  const { data: allUniversities } = useAllUniversities()

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

  // Mock function to simulate getting pending universities
  // In a real app, you'd get this from events or a backend service
  useEffect(() => {
    // This would be replaced with actual contract events or backend API
    const mockPendingUniversities = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
    ]
    setPendingUniversities(mockPendingUniversities)

    // Mock university profiles
    setUniversityProfiles({
      '0x1234567890123456789012345678901234567890': {
        name: 'Harvard University',
        metadataURI: 'https://ipfs.io/ipfs/QmHarvard',
        isVerified: false,
        profileCID: 'QmHarvard'
      },
      '0x2345678901234567890123456789012345678901': {
        name: 'MIT',
        metadataURI: 'https://ipfs.io/ipfs/QmMIT',
        isVerified: false,
        profileCID: 'QmMIT'
      }
    })
  }, [])

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

        {/* Platform Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{pendingUniversities.length}</div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{allUniversities?.length || 0}</div>
              <p className="text-sm text-gray-600">Total Universities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <p className="text-sm text-gray-600">Total Diplomas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">567</div>
              <p className="text-sm text-gray-600">Active Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending University Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending University Approvals</CardTitle>
            <CardDescription>
              Review and approve university registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUniversities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending university approvals
              </p>
            ) : (
              <div className="space-y-4">
                {pendingUniversities.map((universityAddress) => {
                  const profile = universityProfiles[universityAddress]
                  if (!profile) return null

                  return (
                    <div key={universityAddress} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{profile.name}</h3>
                        <p className="text-sm text-gray-600">
                          Address: {formatAddress(universityAddress)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">Pending Approval</Badge>
                          {profile.profileCID && (
                            <a 
                              href={`https://ipfs.io/ipfs/${profile.profileCID}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Profile →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveUniversity(universityAddress)}
                          disabled={isApproving || isApproveTxLoading}
                          size="sm"
                        >
                          {isApproving || isApproveTxLoading ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </div>
                    </div>
                  )
                })}
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
              <Button variant="outline" className="w-full">
                Update Gas Relay Settings
              </Button>
              <Button variant="outline" className="w-full">
                Manage Fee Structure
              </Button>
              <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="w-full">
                University Activity Report
              </Button>
              <Button variant="outline" className="w-full">
                Diploma Issuance Trends
              </Button>
              <Button variant="outline" className="w-full">
                Verification Statistics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 