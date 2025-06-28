'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useBatchGenerateDiplomas } from '@/hooks/useContracts'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StudentEntry {
  address: string
  diplomaHash: string
  id: number
}

export function BatchDiplomaForm() {
  const [students, setStudents] = useState<StudentEntry[]>([
    { id: 1, address: '', diplomaHash: '' }
  ])
  const [csvInput, setCsvInput] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('manual')

  const { batchGenerateDiplomas, isPending } = useBatchGenerateDiplomas()

  // Add new student row
  const addStudentRow = () => {
    const newId = Math.max(...students.map(s => s.id)) + 1
    setStudents([...students, { id: newId, address: '', diplomaHash: generateRandomHash() }])
  }

  // Remove student row
  const removeStudentRow = (id: number) => {
    if (students.length > 1) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  // Update student data
  const updateStudent = (id: number, field: 'address' | 'diplomaHash', value: string) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  // Generate random hash
  const generateRandomHash = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `diploma-${timestamp}-${random}`
  }

  // Auto-generate hashes for all empty fields
  const generateAllHashes = () => {
    setStudents(students.map(s => ({
      ...s,
      diplomaHash: s.diplomaHash || generateRandomHash()
    })))
  }

  // Validate Ethereum address
  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Parse CSV input
  const parseCsvInput = () => {
    try {
      const lines = csvInput.trim().split('\n')
      const newStudents: StudentEntry[] = []

      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return

        const parts = trimmedLine.split(',').map(p => p.trim())
        
        if (parts.length === 1) {
          // Only address provided, generate hash
          newStudents.push({
            id: index + 1,
            address: parts[0],
            diplomaHash: generateRandomHash()
          })
        } else if (parts.length === 2) {
          // Address and hash provided
          newStudents.push({
            id: index + 1,
            address: parts[0],
            diplomaHash: parts[1]
          })
        }
      })

      if (newStudents.length > 0) {
        setStudents(newStudents)
        setActiveTab('manual') // Switch to manual tab to show parsed data
        setStatus(`Parsed ${newStudents.length} students from CSV`)
      } else {
        setError('No valid entries found in CSV input')
      }
    } catch (error) {
      console.error('CSV parsing error:', error)
      setError('Failed to parse CSV input. Please check the format.')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    setError('')
    setTransactionHash(null)

    // Validation
    const validStudents = students.filter(s => s.address && s.diplomaHash)
    
    if (validStudents.length === 0) {
      setError('Please add at least one student with both address and diploma hash')
      return
    }

    if (validStudents.length > 100) {
      setError('Maximum batch size is 100 diplomas')
      return
    }

    // Validate all addresses
    for (const student of validStudents) {
      if (!isValidEthereumAddress(student.address)) {
        setError(`Invalid Ethereum address: ${student.address}`)
        return
      }
    }

    // Check for duplicate addresses
    const addresses = validStudents.map(s => s.address.toLowerCase())
    const uniqueAddresses = new Set(addresses)
    if (addresses.length !== uniqueAddresses.size) {
      setError('Duplicate student addresses found. Each student should be unique.')
      return
    }

    // Check for duplicate hashes
    const hashes = validStudents.map(s => s.diplomaHash)
    const uniqueHashes = new Set(hashes)
    if (hashes.length !== uniqueHashes.size) {
      setError('Duplicate diploma hashes found. Each diploma hash should be unique.')
      return
    }

    try {
      setIsSubmitting(true)
      setStatus(`Preparing to issue ${validStudents.length} diplomas...`)

      const studentAddresses = validStudents.map(s => s.address as `0x${string}`)
      const diplomaHashes = validStudents.map(s => s.diplomaHash)

      console.log('Batch generating diplomas:', {
        count: validStudents.length,
        addresses: studentAddresses,
        hashes: diplomaHashes
      })

      const hash = await batchGenerateDiplomas(studentAddresses, diplomaHashes)
      
      setTransactionHash(hash)
      setStatus(`Batch transaction submitted successfully! ${validStudents.length} diplomas being generated...`)
      
      // Reset form on success
      setTimeout(() => {
        setStudents([{ id: 1, address: '', diplomaHash: generateRandomHash() }])
        setCsvInput('')
      }, 3000)

    } catch (err: unknown) {
      console.error('Batch generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate diplomas')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Issue Diplomas</CardTitle>
        <CardDescription>
          Issue multiple diplomas at once to save time and gas costs. Maximum 100 diplomas per batch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              {status}
              {transactionHash && (
                <div className="mt-2">
                  <a 
                    href={`https://sepolia.arbiscan.io/tx/${transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View transaction on Arbiscan
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div>
              <Label htmlFor="csvInput">CSV Input</Label>
              <Textarea
                id="csvInput"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Enter student data in CSV format:&#10;0x1234..., diploma-hash-1&#10;0x5678..., diploma-hash-2&#10;&#10;Or just addresses (hashes will be auto-generated):&#10;0x1234...&#10;0x5678..."
                rows={8}
                disabled={isSubmitting || isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Each line should contain: address,diploma-hash (or just address for auto-generated hash)
              </p>
            </div>
            <Button
              type="button"
              onClick={parseCsvInput}
              disabled={!csvInput.trim() || isSubmitting || isPending}
              variant="outline"
            >
              Parse CSV Data
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {students.filter(s => s.address && s.diplomaHash).length} / {students.length} complete
                  </Badge>
                  <Badge variant="secondary">
                    Max: 100 diplomas
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={generateAllHashes}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || isPending}
                  >
                    Generate All Hashes
                  </Button>
                  <Button
                    type="button"
                    onClick={addStudentRow}
                    variant="outline"
                    size="sm"
                    disabled={students.length >= 100 || isSubmitting || isPending}
                  >
                    Add Student
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-md p-4">
                {students.map((student, index) => (
                  <div key={student.id} className="flex gap-2 items-start p-3 border rounded bg-gray-50">
                    <div className="flex-shrink-0 text-sm text-gray-500 mt-2 w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label htmlFor={`address-${student.id}`} className="text-xs">
                          Student Address
                        </Label>
                        <Input
                          id={`address-${student.id}`}
                          value={student.address}
                          onChange={(e) => updateStudent(student.id, 'address', e.target.value)}
                          placeholder="0x..."
                          disabled={isSubmitting || isPending}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`hash-${student.id}`} className="text-xs">
                          Diploma Hash
                        </Label>
                        <div className="flex gap-1">
                          <Input
                            id={`hash-${student.id}`}
                            value={student.diplomaHash}
                            onChange={(e) => updateStudent(student.id, 'diplomaHash', e.target.value)}
                            placeholder="Unique diploma identifier"
                            disabled={isSubmitting || isPending}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            onClick={() => updateStudent(student.id, 'diplomaHash', generateRandomHash())}
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting || isPending}
                            className="flex-shrink-0"
                          >
                            Gen
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeStudentRow(student.id)}
                      variant="destructive"
                      size="sm"
                      disabled={students.length <= 1 || isSubmitting || isPending}
                      className="flex-shrink-0 mt-6"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  students.filter(s => s.address && s.diplomaHash).length === 0 ||
                  isSubmitting ||
                  isPending
                }
              >
                {isSubmitting || isPending ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing Batch...
                  </>
                ) : (
                  `Issue ${students.filter(s => s.address && s.diplomaHash).length} Diplomas`
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Batch Issuance Information</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Maximum 100 diplomas per batch transaction</li>
            <li>• Each student address must be unique within the batch</li>
            <li>• Each diploma hash must be unique within the batch</li>
            <li>• Gas costs scale with batch size - larger batches are more efficient</li>
            <li>• All diplomas in the batch will be processed in a single transaction</li>
            <li>• If any diploma fails, the entire batch will be reverted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 