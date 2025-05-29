// Contract addresses
export const CONTRACTS = {
  ACCESS_CONTROL: process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS as `0x${string}`,
  REGISTRY: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
  DIPLOMA: process.env.NEXT_PUBLIC_DIPLOMA_ADDRESS as `0x${string}`,
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`,
}

// Basic ABIs for the POD contracts
export const accessControlAbi = [
  {
    type: 'function',
    name: 'ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UNIVERSITY_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantUniversityRole',
    inputs: [{ type: 'address', name: 'university' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const registryAbi = [
  {
    type: 'function',
    name: 'registerUniversity',
    inputs: [
      { type: 'string', name: 'name' },
      { type: 'string', name: 'country' }
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveUniversity',
    inputs: [{ type: 'address', name: 'university' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'universities',
    inputs: [{ type: 'address' }],
    outputs: [
      { type: 'string', name: 'name' },
      { type: 'string', name: 'country' },
      { type: 'bool', name: 'isApproved' },
      { type: 'bool', name: 'isRegistered' }
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllUniversities',
    inputs: [],
    outputs: [{ type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isUniversityApproved',
    inputs: [{ type: 'address', name: 'university' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'UniversityRegistered',
    inputs: [
      { type: 'address', indexed: true, name: 'university' },
      { type: 'string', name: 'name' },
      { type: 'string', name: 'country' }
    ],
  },
  {
    type: 'event',
    name: 'UniversityApproved',
    inputs: [
      { type: 'address', indexed: true, name: 'university' },
      { type: 'string', name: 'name' },
      { type: 'string', name: 'country' }
    ],
  },
] as const

export const diplomaAbi = [
  {
    type: 'function',
    name: 'generateDiploma',
    inputs: [
      { type: 'address', name: 'student' },
      { type: 'string', name: 'diplomaHash' }
    ],
    outputs: [{ type: 'bytes32', name: 'diplomaId' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchGenerateDiplomas',
    inputs: [
      { type: 'address[]', name: 'students' },
      { type: 'string[]', name: 'diplomaHashes' }
    ],
    outputs: [{ type: 'bytes32[]', name: 'diplomaIds' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'verifyDiploma',
    inputs: [{ type: 'bytes32', name: 'diplomaId' }],
    outputs: [
      { type: 'bool', name: 'isValid' },
      {
        type: 'tuple',
        name: 'diploma',
        components: [
          { type: 'address', name: 'university' },
          { type: 'address', name: 'student' },
          { type: 'uint64', name: 'issueDate' },
          { type: 'bool', name: 'isMinted' },
          { type: 'string', name: 'diplomaHash' }
        ]
      }
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStudentDiplomas',
    inputs: [{ type: 'address', name: 'student' }],
    outputs: [{ type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isDiplomaMinted',
    inputs: [{ type: 'bytes32', name: 'diplomaId' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'DiplomaGenerated',
    inputs: [
      { type: 'bytes32', indexed: true, name: 'diplomaId' },
      { type: 'address', indexed: true, name: 'university' },
      { type: 'address', indexed: true, name: 'student' },
      { type: 'uint256', name: 'timestamp' }
    ],
  },
] as const

export const tokenAbi = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mintDiploma',
    inputs: [
      { type: 'bytes32', name: 'diplomaId' },
      { type: 'string', name: 'metadataURI' }
    ],
    outputs: [{ type: 'uint256', name: 'tokenId' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDiplomaIdForToken',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTokenIdForDiploma',
    inputs: [{ type: 'bytes32', name: 'diplomaId' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'DiplomaMinted',
    inputs: [
      { type: 'uint256', indexed: true, name: 'tokenId' },
      { type: 'bytes32', indexed: true, name: 'diplomaId' },
      { type: 'address', indexed: true, name: 'student' }
    ],
  },
] as const 