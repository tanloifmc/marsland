import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `CERT-MARS-${timestamp}-${random}`.toUpperCase()
}

export function generateVerificationHash(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function generateLandCoordinates(): string {
  const lat = (Math.random() * 180 - 90).toFixed(6)
  const lng = (Math.random() * 360 - 180).toFixed(6)
  return `Lat: ${lat}, Lng: ${lng}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'approved':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'issued':
      return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/20'
    case 'completed':
      return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'failed':
      return 'text-red-400 bg-red-400/10 border-red-400/20'
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return '⏳'
    case 'approved':
      return '✅'
    case 'issued':
      return '🎉'
    case 'rejected':
      return '❌'
    case 'completed':
      return '✅'
    case 'failed':
      return '❌'
    default:
      return '❓'
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  )
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateQRCodeUrl(data: string): string {
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
  const params = new URLSearchParams({
    size: '200x200',
    data: data,
    format: 'png',
    bgcolor: 'ffffff',
    color: '000000',
    margin: '10',
  })
  return `${baseUrl}?${params.toString()}`
}

export function getVerificationUrl(hash: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://marsland.vercel.app'
  return `${baseUrl}/verify?hash=${hash}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

