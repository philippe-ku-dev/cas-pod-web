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
  return useWriteContract()
}

// Hook for diploma minting
export function useMintDiploma() {
  return useWriteContract()
} 