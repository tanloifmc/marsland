// /app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server' // <-- SỬ DỤNG SERVER CLIENT
import DashboardClientPage from './DashboardClientPage' // <-- Component Client mới

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Nếu không có user, chuyển hướng về trang đăng nhập
    return redirect('/login')
  }

  // Lấy profile và certificates ở phía server
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: certificates } = await supabase.from('certificates').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })

  // Truyền dữ liệu xuống cho Client Component để xử lý tương tác
  return (
    <DashboardClientPage
      user={user}
      initialProfile={profile}
      initialCertificates={certificates || []}
    />
  )
}
