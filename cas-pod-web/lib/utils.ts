import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string | undefined): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString()
}

export function parseWagmiError(error: any) {
  if (!error) return null

  // User rejected transaction
  if (error.message?.includes('user rejected') || error.message?.includes('rejected')) {
    return {
      title: 'Transaction rejected',
      message: 'You rejected the transaction. No changes were made.',
      severity: 'info',
    }
  }
  
  // Gas estimation errors
  if (error.message?.includes('gas') || error.message?.includes('fee')) {
    return {
      title: 'Transaction Error',
      message: 'Unable to estimate gas for this transaction. It may revert or fail.',
      severity: 'error',
    }
  }
  
  // Network errors
  if (error.message?.includes('network') || error.message?.includes('disconnected')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the blockchain. Please check your connection.',
      severity: 'error',
    }
  }
  
  // Contract errors
  if (error.message?.includes('execution reverted')) {
    const reasonMatch = error.message.match(/execution reverted: (.*?)(?:$|")/);
    const reason = reasonMatch ? reasonMatch[1] : 'Contract error';
    
    return {
      title: 'Smart Contract Error',
      message: reason,
      severity: 'error',
    }
  }
  
  // Default error
  return {
    title: 'Transaction Error',
    message: error.message || 'An unknown error occurred',
    severity: 'error',
  }
}
