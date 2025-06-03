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

// Hook for diploma minting
export function useMintDiploma() {
  return useWriteContract()
} 