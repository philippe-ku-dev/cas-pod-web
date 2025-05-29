import { arbitrumSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'POD - Proof of Degree',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [arbitrumSepolia],
  ssr: true,
}) 