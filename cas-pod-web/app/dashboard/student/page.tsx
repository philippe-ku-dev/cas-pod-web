'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useStudentDiplomas, useMintDiploma, useNFTBalance, useIsDiplomaMinted } from '@/hooks/useContracts'
import { formatAddress } from '@/lib/utils'
import { CONTRACTS, tokenAbi } from '@/lib/contracts'
import Link from 'next/link'
import { useState } from 'react'

export default function StudentDashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: diplomas, isLoading, error } = useStudentDiplomas(address)
  const { data: nftBalance, isLoading: isNFTLoading } = useNFTBalance(address)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access your student dashboard.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go Back</Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">
            Manage your digital diplomas and credentials
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Connected as: {formatAddress(address)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎓 My Diplomas</CardTitle>
              <CardDescription>
                View all your issued diplomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {diplomas?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Total diplomas issued</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏆 NFT Collection</CardTitle>
              <CardDescription>
                Minted diploma NFTs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {isNFTLoading ? '...' : (nftBalance ? Number(nftBalance) : 0)}
              </div>
              <p className="text-sm text-gray-600">NFTs in your wallet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔗 Shared Links</CardTitle>
              <CardDescription>
                Verification links created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                0
              </div>
              <p className="text-sm text-gray-600">Active verification links</p>
            </CardContent>
          </Card>
        </div>

        {/* Diplomas List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Diplomas</CardTitle>
            <CardDescription>
              All diplomas issued to your address
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading your diplomas...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading diplomas: {error.message}</p>
              </div>
            ) : !diplomas || diplomas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Diplomas Yet</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any diplomas issued to your address yet. 
                  Contact your university to get your credentials issued.
                </p>
                <Button asChild>
                  <Link href="/verify">Verify a Diploma</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {diplomas.map((diplomaId: string, index: number) => (
                  <DiplomaCard key={diplomaId} diplomaId={diplomaId} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How to Get Your Diploma</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contact your university's registrar office</li>
                  <li>• Provide them with your wallet address</li>
                  <li>• Wait for them to issue your digital diploma</li>
                  <li>• Your diploma will appear in this dashboard</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How to Mint NFT</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Once your diploma is issued, click "Mint NFT"</li>
                  <li>• Confirm the transaction in your wallet</li>
                  <li>• Your diploma NFT will be minted to your address</li>
                  <li>• You can then showcase it in your digital portfolio</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component for individual diploma cards
function DiplomaCard({ diplomaId }: { diplomaId: string }) {
  // Use enhanced minting hook with gas optimization
  const { 
    mintDiploma, 
    isPending: isMinting,
    isSuccess: isMintSuccess,
    error: mintError 
  } = useMintDiploma()
  
  // Check if diploma is already minted
  const { data: isMinted, isLoading: isMintedLoading } = useIsDiplomaMinted(diplomaId as `0x${string}`)
  
  const [txHash, setTxHash] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [copyIdSuccess, setCopyIdSuccess] = useState(false)
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false)

  const { isLoading: isMintTxLoading, isSuccess: isMintTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  })

  const handleMintNFT = async () => {
    try {
      setLocalError(null)
      console.log('Starting minting process for diploma:', diplomaId)
      
      const hash = await mintDiploma(
        diplomaId as `0x${string}`, 
        `https://metadata.pod-chain.io/${diplomaId}`
      )
      
      setTxHash(hash)
      console.log('Minting transaction submitted:', hash)
    } catch (error: any) {
      console.error('Minting failed:', error)
      setLocalError(error.message || 'Minting failed. Please try again.')
    }
  }

  const handleCopyDiplomaId = async () => {
    try {
      await navigator.clipboard.writeText(diplomaId)
      setCopyIdSuccess(true)
      setTimeout(() => setCopyIdSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy diploma ID:', err)
      alert('Failed to copy. Please copy manually: ' + diplomaId)
    }
  }

  const handleCopyVerificationLink = async () => {
    try {
      if (typeof window === 'undefined') {
        alert('Verification link generation is not available')
        return
      }
      
      const verificationUrl = `${window.location.origin}/verify?id=${diplomaId}`
      await navigator.clipboard.writeText(verificationUrl)
      setCopyLinkSuccess(true)
      setTimeout(() => setCopyLinkSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy verification link:', err)
      alert('Failed to copy verification link.')
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Error Messages */}
      {(mintError || localError) && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {localError || mintError?.message || 'An error occurred during minting'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Messages */}
      {isMintTxSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            NFT minted successfully! 
            {txHash && (
              <span>
                {' '}View transaction: <a 
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Transaction Status */}
      {txHash && isMintTxLoading && (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Transaction submitted. Waiting for confirmation...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">Diploma</h4>
            {isMinted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                ✅ NFT Minted
              </span>
            )}
            {isMintedLoading && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                🔄 Checking...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-mono">
            {diplomaId.slice(0, 10)}...{diplomaId.slice(-8)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/verify?id=${diplomaId}`}>View Details</Link>
          </Button>
          <Button 
            size="sm" 
            onClick={handleMintNFT}
            disabled={isMinting || isMintTxLoading || isMintTxSuccess || isMinted || isMintedLoading}
            variant={isMinted ? "secondary" : "default"}
          >
            {isMintedLoading ? 'Checking...' : 
             isMinted ? '✅ Already Minted' :
             isMinting || isMintTxLoading ? 'Minting...' : 
             isMintTxSuccess ? 'Minted!' : 
             'Mint NFT'}
          </Button>
        </div>
      </div>

      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Diploma ID Section */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-700">📜 Diploma ID</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyDiplomaId}
                className={copyIdSuccess ? 'text-green-600' : 'text-gray-500'}
              >
                {copyIdSuccess ? '✅ Copied!' : '📋 Copy ID'}
              </Button>
            </div>
            <p className="font-mono text-xs text-gray-600 break-all">
              {diplomaId}
            </p>
          </div>

          {/* Verification Link Section */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-blue-700">🔗 Verification Link</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyVerificationLink}
                className={copyLinkSuccess ? 'text-green-600' : 'text-blue-600'}
              >
                {copyLinkSuccess ? '✅ Copied!' : '🔗 Copy Link'}
              </Button>
            </div>
            <p className="text-xs text-blue-600">
              Share this link to allow others to verify your diploma
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  )
} 