import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminProfile } from '../types/database'

export interface AuthState {
  user: ReturnType<typeof supabase.auth.getUser> extends Promise<{ data: { user: infer U } }> ? U : null
  profile: AdminProfile | null
  loading: boolean
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthState['user']>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
        setLoading(false)
      }
    }

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (mounted) setProfile(data ?? null)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  return {
    user,
    profile,
    loading,
    isAdmin: !!profile,
    signIn,
    signOut,
  }
}
