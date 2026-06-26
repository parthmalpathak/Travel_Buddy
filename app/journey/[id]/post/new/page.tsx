import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PostForm } from './PostForm'

export default async function NewPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: stops }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('stops').select('*').eq('journey_id', params.id).order('order_index'),
  ])

  return (
    <div className="min-h-screen bg-surface">
      <Header profile={profile} />
      <PostForm journeyId={params.id} stops={stops ?? []} />
    </div>
  )
}
