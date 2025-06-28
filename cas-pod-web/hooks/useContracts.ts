import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { CONTRACTS, registryAbi, diplomaAbi, tokenAbi, accessControlAbi } from '@/lib/contracts'

// Roles
const UNIVERSITY_ROLE = '0xdc4648e77df7cf7ca17990f8bdb7abb3f73c222fea09da6c9bc6df7cbe9cef78' as const
const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as const

// Hook for reading university information
export function useUniversityInfo(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'universities',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 10000, // Consider data stale after 10 seconds
      gcTime: 30000, // Keep data in cache for garbage collection for 30 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  })
}

// Hook for checking if an address has university role
export function useHasUniversityRole(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: address ? [UNIVERSITY_ROLE, address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5000,
      gcTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  })
}

// Hook for checking if an address has admin role
export function useHasAdminRole(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: address ? [ADMIN_ROLE, address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5000,
      gcTime: 30000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  })
}

// Hook for getting student diplomas
export function useStudentDiplomas(studentAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.DIPLOMA,
    abi: diplomaAbi,
    functionName: 'getStudentDiplomas',
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: !!studentAddress,
    },
  })
}

// Hook for verifying a diploma
export function useVerifyDiploma(diplomaId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.DIPLOMA,
    abi: diplomaAbi,
    functionName: 'verifyDiploma',
    args: diplomaId ? [diplomaId] : undefined,
    query: {
      enabled: !!diplomaId,
      staleTime: 60000, // Cache for 1 minute
      gcTime: 300000, // Keep in cache for 5 minutes
    },
  })
}

// Hook for checking if a diploma is already minted (NFT exists)
export function useIsDiplomaMinted(diplomaId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.DIPLOMA,
    abi: diplomaAbi,
    functionName: 'isDiplomaMinted',
    args: diplomaId ? [diplomaId] : undefined,
    query: {
      enabled: !!diplomaId,
      staleTime: 30000,
      gcTime: 300000,
    },
  })
}

// Hook for getting all universities
export function useAllUniversities() {
  return useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'getAllUniversities',
  })
}

// Hook for university registration
export function useRegisterUniversity() {
  return useWriteContract()
}

// Hook for diploma generation
export function useGenerateDiploma() {
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract()
  
  const generateDiploma = async (studentAddress: `0x${string}`, diplomaHash: string) => {
    if (!studentAddress || !diplomaHash) {
      throw new Error('Student address and diploma hash are required')
    }
    
    // First attempt with higher gas limit
    try {
      console.log("Attempting to generate diploma with first gas configuration")
      const txHash = await writeContractAsync({
        address: CONTRACTS.DIPLOMA,
        abi: diplomaAbi,
        functionName: 'generateDiploma',
        args: [studentAddress, diplomaHash],
        // Set explicit gas parameters
        gas: BigInt(800000), // Higher gas limit
        maxFeePerGas: BigInt(500000000), // 0.5 gwei
        maxPriorityFeePerGas: BigInt(200000000), // 0.2 gwei
      })
      
      return txHash
    } catch (error: any) {
      // Extract error message
      const errorMessage = error?.message || String(error)
      console.error('First attempt failed:', errorMessage)
      
      // Check for specific errors
      if (errorMessage.includes('PODDiplomaUnauthorized')) {
        throw new Error('Your address is not authorized as a university. Please make sure you are approved by an admin.')
      }
      
      if (errorMessage.includes('PODDiplomaDuplicateEntry')) {
        throw new Error('This diploma already exists for this student. Please use a different diploma hash.')
      }
      
      if (errorMessage.includes('execution reverted')) {
        // Try again with different gas parameters
        try {
          console.log("Retrying with alternate gas configuration")
          const txHash = await writeContractAsync({
            address: CONTRACTS.DIPLOMA,
            abi: diplomaAbi,
            functionName: 'generateDiploma',
            args: [studentAddress, diplomaHash],
            // Different gas configuration
            gas: BigInt(1000000), // Even higher gas limit
            maxFeePerGas: BigInt(300000000), // 0.3 gwei
            maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
          })
          
          return txHash
        } catch (retryError) {
          console.error('Second attempt failed:', retryError)
          throw new Error('Transaction reverted by the contract. You may not have university permissions or the diploma hash might already exist.')
        }
      }
      
      // Rethrow the original error
      throw error
    }
  }
  
  return { 
    generateDiploma, 
    isPending, 
    isSuccess, 
    error 
  }
}

// Hook for batch diploma generation
export function useBatchGenerateDiplomas() {
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract()
  
  const batchGenerateDiplomas = async (
    studentAddresses: `0x${string}`[], 
    diplomaHashes: string[]
  ) => {
    if (!studentAddresses?.length || !diplomaHashes?.length) {
      throw new Error('Student addresses and diploma hashes arrays are required')
    }
    
    if (studentAddresses.length !== diplomaHashes.length) {
      throw new Error('Student addresses and diploma hashes arrays must have the same length')
    }
    
    if (studentAddresses.length > 100) {
      throw new Error('Batch size cannot exceed 100 diplomas')
    }
    
    // Validate all addresses
    for (const address of studentAddresses) {
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error(`Invalid student address: ${address}`)
      }
    }
    
    // Validate all diploma hashes
    for (const hash of diplomaHashes) {
      if (!hash || hash.trim() === '') {
        throw new Error('All diploma hashes must be non-empty')
      }
    }
    
    try {
      console.log(`Attempting to batch generate ${studentAddresses.length} diplomas`)
      const txHash = await writeContractAsync({
        address: CONTRACTS.DIPLOMA,
        abi: diplomaAbi,
        functionName: 'batchGenerateDiplomas',
        args: [studentAddresses, diplomaHashes],
        // Set explicit gas parameters for batch operation
        gas: BigInt(Math.min(5000000, 150000 + (studentAddresses.length * 200000))), // Dynamic gas based on batch size
        maxFeePerGas: BigInt(500000000), // 0.5 gwei
        maxPriorityFeePerGas: BigInt(200000000), // 0.2 gwei
      })
      
      return txHash
    } catch (error: any) {
      // Extract error message
      const errorMessage = error?.message || String(error)
      console.error('Batch generation failed:', errorMessage)
      
      // Check for specific errors
      if (errorMessage.includes('PODDiplomaUnauthorized')) {
        throw new Error('Your address is not authorized as a university. Please make sure you are approved by an admin.')
      }
      
      if (errorMessage.includes('PODDiplomaDuplicateEntry')) {
        throw new Error('One or more diplomas already exist for the provided students. Please check for duplicates.')
      }
      
      if (errorMessage.includes('PODDiplomaInvalidInput')) {
        throw new Error('Invalid input provided. Check that all addresses are valid and arrays match in length.')
      }
      
      if (errorMessage.includes('execution reverted')) {
        // Try again with higher gas limit
        try {
          console.log("Retrying batch generation with higher gas limit")
          const txHash = await writeContractAsync({
            address: CONTRACTS.DIPLOMA,
            abi: diplomaAbi,
            functionName: 'batchGenerateDiplomas',
            args: [studentAddresses, diplomaHashes],
            // Higher gas configuration
            gas: BigInt(Math.min(8000000, 200000 + (studentAddresses.length * 300000))), // Even higher dynamic gas
            maxFeePerGas: BigInt(300000000), // 0.3 gwei
            maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
          })
          
          return txHash
        } catch (retryError) {
          console.error('Batch generation retry failed:', retryError)
          throw new Error('Batch transaction failed. You may not have university permissions or some diplomas might already exist.')
        }
      }
      
      // Rethrow the original error
      throw error
    }
  }
  
  return { 
    batchGenerateDiplomas, 
    isPending, 
    isSuccess, 
    error 
  }
}

// Hook for diploma minting
export function useMintDiploma() {
  const { writeContractAsync, isPending, isSuccess, error } = useWriteContract()
  
  const mintDiploma = async (diplomaId: `0x${string}`, metadataURI: string) => {
    if (!diplomaId || !metadataURI) {
      throw new Error('Diploma ID and metadata URI are required')
    }
    
    // First attempt with optimized gas parameters
    try {
      console.log("Attempting to mint diploma with first gas configuration")
      const txHash = await writeContractAsync({
        address: CONTRACTS.TOKEN,
        abi: tokenAbi,
        functionName: 'mintDiploma',
        args: [diplomaId, metadataURI],
        // Set explicit gas parameters for minting
        gas: BigInt(500000), // Reasonable gas limit for minting
        maxFeePerGas: BigInt(500000000), // 0.5 gwei
        maxPriorityFeePerGas: BigInt(200000000), // 0.2 gwei
      })
      
      return txHash
    } catch (error: any) {
      // Extract error message
      const errorMessage = error?.message || String(error)
      console.error('First minting attempt failed:', errorMessage)
      
      // Check for specific errors
      if (errorMessage.includes('InvalidDiplomaError')) {
        throw new Error('This diploma is invalid or has already been minted.')
      }
      
      if (errorMessage.includes('UnauthorizedError')) {
        throw new Error('You are not authorized to mint this diploma. Only the diploma owner can mint.')
      }
      
      if (errorMessage.includes('execution reverted')) {
        // Try again with different gas parameters
        try {
          console.log("Retrying minting with alternate gas configuration")
          const txHash = await writeContractAsync({
            address: CONTRACTS.TOKEN,
            abi: tokenAbi,
            functionName: 'mintDiploma',
            args: [diplomaId, metadataURI],
            // Alternative gas configuration
            gas: BigInt(700000), // Higher gas limit
            maxFeePerGas: BigInt(300000000), // 0.3 gwei
            maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
          })
          
          return txHash
        } catch (retryError) {
          console.error('Second minting attempt failed:', retryError)
          throw new Error('Transaction reverted. You may not own this diploma or it may already be minted.')
        }
      }
      
      // Rethrow the original error
      throw error
    }
  }
  
  return { 
    mintDiploma, 
    isPending, 
    isSuccess, 
    error 
  }
}

// Hook for getting user's NFT balance
export function useNFTBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.TOKEN,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30000,
      gcTime: 300000,
    },
  })
} 