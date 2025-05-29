'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CONTRACTS, accessControlAbi } from '@/lib/contracts'
import { useAllUniversities, useHasUniversityRole } from '@/hooks/useContracts'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access the dashboard.
            </p>
            <Button asChild>
              <Link href="/">Go Back</Link>
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your POD dashboard. Choose your role to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Student Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎓 Student
              </CardTitle>
              <CardDescription>
                View and manage your digital diplomas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • View your issued diplomas
                </p>
                <p className="text-sm text-gray-600">
                  • Mint diploma NFTs
                </p>
                <p className="text-sm text-gray-600">
                  • Share verification links
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/dashboard/student">Student Portal</Link>
              </Button>
            </CardContent>
          </Card>

          {/* University Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏛️ University
              </CardTitle>
              <CardDescription>
                Issue and manage student credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Register your institution
                </p>
                <p className="text-sm text-gray-600">
                  • Issue digital diplomas
                </p>
                <p className="text-sm text-gray-600">
                  • Batch operations
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/dashboard/university">University Portal</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👨‍💼 Admin
              </CardTitle>
              <CardDescription>
                Manage platform and approve universities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Approve university registrations
                </p>
                <p className="text-sm text-gray-600">
                  • Manage platform settings
                </p>
                <p className="text-sm text-gray-600">
                  • View system analytics
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/dashboard/admin">Admin Portal</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Verifier Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Verifier
              </CardTitle>
              <CardDescription>
                Verify credentials and check authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Verify diploma authenticity
                </p>
                <p className="text-sm text-gray-600">
                  • Check issuing institution
                </p>
                <p className="text-sm text-gray-600">
                  • View credential details
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/verify">Verify Credentials</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
