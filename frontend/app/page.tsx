// /app/page.tsx
import HomeClientPage from './HomeClientPage' // <-- Component Client mới

// Trang này bây giờ là một Server Component, không có 'use client'
export default function HomePage() {
  // Trang chủ không cần lấy dữ liệu user/profile ở đây
  // Nó chỉ cần render ra Client Component
  return <HomeClientPage />
}
