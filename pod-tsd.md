# POD (Proof of Degree) - Technical Specification Document

## 1. System Architecture

### 1.1 Overview
POD is implemented as a set of smart contracts on the Arbitrum Sepolia testnet. The system uses a modular architecture with separate contracts for role management, diploma issuance, and token functionality.

### 1.2 Contract Structure
```
PODAccessControl
↑
PODRegistry ← PODDiploma → PODToken
```

- **PODAccessControl**: Handles role-based access control
- **PODRegistry**: Manages university registration and approval
- **PODDiploma**: Handles diploma generation and verification
- **PODToken**: Implements the non-transferable diploma token standard

## 2. Smart Contract Specifications

### 2.1 PODAccessControl

#### 2.1.1 Roles
- `ADMIN_ROLE`: Contract deployer with full system control
- `UNIVERSITY_ROLE`: Approved educational institutions
- `DEFAULT_ADMIN_ROLE`: Required by OpenZeppelin's AccessControl

#### 2.1.2 Key Functions
```solidity
// Grant university role to an address
function grantUniversityRole(address university) external onlyRole(ADMIN_ROLE)

// Revoke university role from an address
function revokeUniversityRole(address university) external onlyRole(ADMIN_ROLE)

// Check if an address has university role
function isUniversity(address account) external view returns (bool)
```

### 2.2 PODRegistry

#### 2.2.1 Data Structures
```solidity
struct University {
    string name;
    string country;
    bool isApproved;
    uint256 registrationDate;
}

// University registry
mapping(address => University) public universities;

// List of registered university addresses
address[] public universityList;
```

#### 2.2.2 Key Functions
```solidity
// Register a new university (anyone can register)
function registerUniversity(string calldata name, string calldata country) external

// Approve a registered university (admin only)
function approveUniversity(address university) external onlyRole(ADMIN_ROLE)

// Revoke university approval (admin only)
function revokeUniversity(address university) external onlyRole(ADMIN_ROLE)

// Get university details
function getUniversity(address university) external view returns (University memory)

// Get all registered universities
function getAllUniversities() external view returns (address[] memory)
```

### 2.3 PODDiploma

#### 2.3.1 Data Structures
```solidity
struct Diploma {
    address university;
    address student;
    string diplomaHash;    // Hash of off-chain diploma details
    uint256 issueDate;
    bool isMinted;
}

// Diploma storage by diploma ID
mapping(bytes32 => Diploma) public diplomas;

// Mapping of student to their diploma IDs
mapping(address => bytes32[]) public studentDiplomas;

// Mapping of university to issued diploma IDs
mapping(address => bytes32[]) public universityDiplomas;
```

#### 2.3.2 Key Functions
```solidity
// Generate a diploma for a student (university only)
function generateDiploma(address student, string calldata diplomaHash) 
    external onlyRole(UNIVERSITY_ROLE) returns (bytes32 diplomaId)

// Batch generate diplomas (university only)
function batchGenerateDiplomas(address[] calldata students, string[] calldata diplomaHashes) 
    external onlyRole(UNIVERSITY_ROLE) returns (bytes32[] memory diplomaIds)

// Mark diploma as minted (internal, called by PODToken)
function markDiplomaAsMinted(bytes32 diplomaId) internal

// Verify a diploma's authenticity
function verifyDiploma(bytes32 diplomaId) external view returns (bool isValid, Diploma memory diploma)

// Get all diplomas for a student
function getStudentDiplomas(address student) external view returns (bytes32[] memory)

// Get all diplomas issued by a university
function getUniversityDiplomas(address university) external view returns (bytes32[] memory)
```

### 2.4 PODToken

#### 2.4.1 Token Standard
Implements ERC-721 with transfer restrictions (soulbound token)

#### 2.4.2 Key Functions
```solidity
// Mint a diploma token (student only)
function mint(bytes32 diplomaId) external

// Override transfer functions to prevent transfers
function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
) internal override {
    require(from == address(0) || to == address(0), "PODToken: Token is soulbound");
    super._beforeTokenTransfer(from, to, tokenId);
}

// Get token URI with metadata
function tokenURI(uint256 tokenId) public view override returns (string memory)
```

## 3. Data Flow & Interactions

### 3.1 University Registration Process
1. University calls `registerUniversity()` with name and country
2. Admin reviews registration and calls `approveUniversity()`
3. System grants `UNIVERSITY_ROLE` to the approved university address

### 3.2 Diploma Generation Process
1. University calls `generateDiploma()` or `batchGenerateDiplomas()`
2. System creates diploma records with unique IDs
3. System associates diplomas with university and student addresses

### 3.3 Diploma Minting Process
1. Student calls `mint()` with their diploma ID
2. System creates a non-transferable ERC-721 token
3. System marks the diploma as minted

### 3.4 Verification Process
1. Verifier calls `verifyDiploma()` with diploma ID
2. System returns authenticity status and diploma details

## 4. Implementation Details

### 4.1 Diploma ID Generation
```solidity
// Generate a unique diploma ID
function _generateDiplomaId(address university, address student, string memory diplomaHash) 
    internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(university, student, diplomaHash));
}
```

### 4.2 Batch Processing Implementation
Batch functions will use gas-optimized loops to process multiple items in a single transaction:

```solidity
function batchGenerateDiplomas(address[] calldata students, string[] calldata diplomaHashes) 
    external onlyRole(UNIVERSITY_ROLE) returns (bytes32[] memory) {
    require(students.length == diplomaHashes.length, "Array lengths must match");
    require(students.length > 0, "Empty arrays");
    
    bytes32[] memory diplomaIds = new bytes32[](students.length);
    
    for (uint256 i = 0; i < students.length; i++) {
        diplomaIds[i] = _generateDiploma(students[i], diplomaHashes[i]);
    }
    
    return diplomaIds;
}
```

### 4.3 Transfer Restriction Implementation
To make tokens soulbound (non-transferable):

```solidity
function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
) internal override {
    // Allow minting (from = 0) and burning (to = 0) but prevent transfers
    require(from == address(0) || to == address(0), "PODToken: Token is soulbound");
    super._beforeTokenTransfer(from, to, tokenId);
}
```

### 4.4 Metadata Handling
Token metadata will use the following structure:

```json
{
  "name": "Diploma from [University Name]",
  "description": "Official diploma issued by [University Name]",
  "image": "[IPFS link to diploma image]",
  "attributes": [
    {
      "trait_type": "University",
      "value": "[University Name]"
    },
    {
      "trait_type": "Issue Date",
      "value": "[Timestamp]"
    },
    {
      "display_type": "date",
      "trait_type": "Issue Date",
      "value": "[Unix Timestamp]"
    }
  ]
}
```

## 5. Testing Strategy

### 5.1 Unit Tests
- PODAccessControl: Role management tests
- PODRegistry: University registration and approval tests
- PODDiploma: Diploma generation and verification tests
- PODToken: Minting and transfer restriction tests

### 5.2 Integration Tests
- End-to-end user flows (registration → approval → generation → minting)
- Access control enforcement across contracts
- Edge cases for batch processing

### 5.3 Gas Optimization Tests
- Measure gas usage for batch operations
- Compare gas costs for different implementation approaches

## 6. Deployment Strategy

### 6.1 Deployment Sequence
1. Deploy PODAccessControl
2. Deploy PODRegistry with PODAccessControl address
3. Deploy PODDiploma with PODRegistry address
4. Deploy PODToken with PODDiploma address
5. Grant roles to initial admin account

### 6.2 Deployment Script
A Foundry deployment script will be created to automate this process:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/PODAccessControl.sol";
import "../src/PODRegistry.sol";
import "../src/PODDiploma.sol";
import "../src/PODToken.sol";

contract DeployPOD is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        PODAccessControl accessControl = new PODAccessControl();
        PODRegistry registry = new PODRegistry(address(accessControl));
        PODDiploma diploma = new PODDiploma(address(registry));
        PODToken token = new PODToken(address(diploma));
        
        // Setup initial configuration
        diploma.setPODToken(address(token));
        
        vm.stopBroadcast();
    }
}
```

## 7. Security Considerations

### 7.1 Access Control
- Strict role-based access control for all administrative functions
- Function modifiers to enforce role requirements
- Events for all role changes

### 7.2 Input Validation
- Validate all input parameters
- Check array lengths for batch operations
- Require non-empty strings for names and details

### 7.3 Reentrancy Protection
- Follow checks-effects-interactions pattern
- Use OpenZeppelin's ReentrancyGuard where appropriate

### 7.4 Potential Attack Vectors
- Front-running university registrations
- Diploma ID collisions
- Gas limitations for large batch operations

## 8. Future Technical Considerations

### 8.1 Scalability Improvements
- Optimistic diploma verification
- Merkle tree-based batch verification
- Gas optimization for large university operations

### 8.2 Privacy Enhancements
- Zero-knowledge proofs for selective attribute disclosure
- Encrypted metadata for sensitive information
- Off-chain verification capabilities

### 8.3 Interoperability
- Standards compliance for credential verification
- Integration with decentralized identity systems
- Cross-chain verification mechanisms 