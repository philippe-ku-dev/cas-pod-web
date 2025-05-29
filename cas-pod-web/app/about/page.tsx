'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About POD - Proof of Degree
            </h1>
            <p className="text-xl text-gray-600">
              Revolutionizing credential verification through blockchain technology
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                POD (Proof of Degree) is a revolutionary blockchain-based system that transforms how educational 
                credentials are issued, stored, and verified. Built on the Arbitrum network, our platform ensures 
                that diplomas and certificates are tamper-proof, instantly verifiable, and globally accessible.
              </p>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How POD Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">University Registration</h3>
                    <p className="text-gray-600">
                      Educational institutions register on our platform and undergo a verification process 
                      to ensure legitimacy and accreditation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Diploma Issuance</h3>
                    <p className="text-gray-600">
                      Verified universities issue digital diplomas directly to students' blockchain wallets, 
                      creating an immutable record of achievement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">NFT Minting</h3>
                    <p className="text-gray-600">
                      Students can mint their diplomas as NFTs, providing them with full ownership and 
                      the ability to showcase their credentials in digital portfolios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Instant Verification</h3>
                    <p className="text-gray-600">
                      Employers and institutions can instantly verify credentials using our verification 
                      system, eliminating the need for lengthy verification processes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔒 Security & Trust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cryptographically secured on blockchain</li>
                  <li>• Tamper-proof and immutable records</li>
                  <li>• Verified university issuance</li>
                  <li>• No risk of document forgery</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Speed & Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Instant verification process</li>
                  <li>• No need to contact universities</li>
                  <li>• 24/7 global accessibility</li>
                  <li>• Reduced administrative overhead</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌍 Global Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Access from anywhere in the world</li>
                  <li>• No physical documents required</li>
                  <li>• Cross-border recognition</li>
                  <li>• Digital-first approach</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Cost Effective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Reduced verification costs</li>
                  <li>• No shipping or handling fees</li>
                  <li>• Lower administrative burden</li>
                  <li>• Scalable solution</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Technology */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Blockchain</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Arbitrum Sepolia (Testnet)</li>
                    <li>• Ethereum-compatible smart contracts</li>
                    <li>• ERC-721 NFT standard</li>
                    <li>• Gas-optimized operations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Next.js 15 with TypeScript</li>
                    <li>• Wagmi for Web3 integration</li>
                    <li>• RainbowKit wallet connection</li>
                    <li>• Tailwind CSS for styling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Contracts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Smart Contract Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">PODAccessControl</h3>
                  <p className="text-gray-600 text-sm">
                    Manages role-based access control for administrators and universities.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">PODRegistry</h3>
                  <p className="text-gray-600 text-sm">
                    Handles university registration and approval processes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">PODDiploma</h3>
                  <p className="text-gray-600 text-sm">
                    Core contract for diploma generation and verification.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">PODToken</h3>
                  <p className="text-gray-600 text-sm">
                    ERC-721 NFT contract for minting diploma tokens.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Get Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                POD is an open-source project aimed at revolutionizing credential verification. 
                Whether you're a university, employer, or developer, we welcome your participation.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Universities</h4>
                  <p className="text-sm text-gray-600">
                    Join our network of verified institutions
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Employers</h4>
                  <p className="text-sm text-gray-600">
                    Streamline your credential verification process
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Developers</h4>
                  <p className="text-sm text-gray-600">
                    Contribute to the open-source project
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 