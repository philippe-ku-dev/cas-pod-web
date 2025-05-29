import { useReadContract, useWriteContract } from 'wagmi'
import { CONTRACTS, registryAbi, diplomaAbi, tokenAbi, accessControlAbi } from '@/lib/contracts'

// Hook for reading university information
export function useUniversityInfo(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.REGISTRY,
    abi: registryAbi,
    functionName: 'universities',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// Hook for checking if an address has university role
export function useHasUniversityRole(address: `0x${string}` | undefined) {
  const { data: universityRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'UNIVERSITY_ROLE',
  })

  return useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: universityRole && address ? [universityRole, address] : undefined,
    query: {
      enabled: !!(universityRole && address),
    },
  })
}

// Hook for checking if an address has admin role
export function useHasAdminRole(address: `0x${string}` | undefined) {
  const { data: adminRole } = useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'ADMIN_ROLE',
  })

  return useReadContract({
    address: CONTRACTS.ACCESS_CONTROL,
    abi: accessControlAbi,
    functionName: 'hasRole',
    args: adminRole && address ? [adminRole, address] : undefined,
    query: {
      enabled: !!(adminRole && address),
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

// Hook for university approval (admin only)
export function useApproveUniversity() {
  return useWriteContract()
} 