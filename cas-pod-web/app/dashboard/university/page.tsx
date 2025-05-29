'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUniversityInfo, useHasUniversityRole } from '@/hooks/useContracts'
import { formatAddress } from '@/lib/utils'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function UniversityDashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: universityInfo, isLoading: loadingInfo } = useUniversityInfo(address)
  const { data: hasUniversityRole, isLoading: loadingRole } = useHasUniversityRole(address)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

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
  const isApproved = universityInfo?.[2] // isApproved field

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
            <CardTitle>University Status</CardTitle>
            <CardDescription>
              Your institution's registration and approval status
            </CardDescription>
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !country.trim()) return

    setIsSubmitting(true)
    try {
      // TODO: Implement actual registration logic
      console.log('Registering university:', { name, country })
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      onCancel() // Close form on success
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">University Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter university name"
          required
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
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !name.trim() || !country.trim()}>
          {isSubmitting ? 'Registering...' : 'Register University'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentAddress.trim() || !diplomaHash.trim()) return

    setIsSubmitting(true)
    try {
      // TODO: Implement actual diploma issuance logic
      console.log('Issuing diploma:', { studentAddress, diplomaHash })
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setStudentAddress('')
      setDiplomaHash('')
    } catch (error) {
      console.error('Diploma issuance failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="studentAddress">Student Wallet Address</Label>
        <Input
          id="studentAddress"
          type="text"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          placeholder="0x..."
          required
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
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !studentAddress.trim() || !diplomaHash.trim()}>
        {isSubmitting ? 'Issuing...' : 'Issue Diploma'}
      </Button>
    </form>
  )
} 