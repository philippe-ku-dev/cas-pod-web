'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Proof of Degree
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Secure, verifiable, and tamper-proof digital credentials on the blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/verify">Verify Credential</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose POD?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our blockchain-based system ensures your credentials are secure, verifiable, and always accessible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔒 Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built on Arbitrum blockchain with cryptographic security ensuring your credentials cannot be forged or tampered with.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ Verifiable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant verification by employers, institutions, or anyone with the credential ID. No need to contact issuing institutions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌍 Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access your credentials from anywhere in the world. No physical documents needed, just your digital wallet.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">University Issues</h3>
              <p className="text-gray-600">
                Verified universities issue digital diplomas directly to students' blockchain wallets.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Receives</h3>
              <p className="text-gray-600">
                Students receive their credentials as NFTs in their digital wallet, with full ownership and control.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Anyone Verifies</h3>
              <p className="text-gray-600">
                Employers or institutions can instantly verify credentials using the blockchain verification system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of credential verification today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">Launch App</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 POD - Proof of Degree. Built on Arbitrum.
          </p>
        </div>
      </footer>
    </div>
  )
}
