'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email?: string
  full_name?: string
  tokens_remaining: number
  subscription_tier: 'free' | 'pro'
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshUser = async () => {
    try {
      setLoading(true)
      // Get both user and session to ensure we have an active session
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      // Only set user if we have both user and session (user is actually authenticated)
      if (currentUser && session && !userError) {
        setUser(currentUser)

        // Try to get user profile, with retry logic in case it's being created
        let profile = null
        let retries = 3
        while (retries > 0) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (data && !error) {
            profile = data
            console.log('Profile loaded:', { id: profile.id, tokens: profile.tokens_remaining, email: profile.email })
            
            // If profile exists but has 0 or null tokens, check if user should have 20 tokens
            if ((profile.tokens_remaining === 0 || profile.tokens_remaining === null || profile.tokens_remaining === undefined) && currentUser) {
              // Check if user has any documents - if not, they're a new user who should have 20 tokens
              const { data: documents, error: docError } = await supabase
                .from('documents')
                .select('id')
                .eq('user_id', currentUser.id)
                .limit(1)

              console.log('Checking documents for user:', { userId: currentUser.id, hasDocuments: documents?.length > 0, docError })

              if (!documents || documents.length === 0) {
                // No documents, so this is a new user - give them 20 tokens
                console.log('User has no documents, updating tokens to 20')
                const { data: updatedProfile, error: updateError } = await supabase
                  .from('user_profiles')
                  .update({ tokens_remaining: 20 })
                  .eq('id', currentUser.id)
                  .select()
                  .single()

                if (updatedProfile && !updateError) {
                  console.log('Successfully updated tokens to 20:', updatedProfile)
                  profile = updatedProfile
                } else {
                  console.error('Failed to update tokens:', updateError)
                }
              } else {
                console.log('User has documents, not updating tokens (they may have used them)')
              }
            }
            break
          } else if (error) {
            // Check if profile doesn't exist
            // PGRST116 = no rows returned, PGRST205 = 404 Not Found
            const isProfileNotFound = error.code === 'PGRST116' || 
                                     error.code === 'PGRST205' || 
                                     error.message?.includes('No rows') ||
                                     error.message?.includes('Not Found') ||
                                     (error as any).status === 404

            if (isProfileNotFound) {
              console.log('Profile not found, attempting to create using RPC function...')
              // Profile doesn't exist yet, try to create it using the database function
              try {
                const { data: newProfile, error: createError } = await supabase
                  .rpc('create_user_profile', { p_email: currentUser.email || null })

                if (createError) {
                  console.error('RPC function error:', {
                    message: createError.message,
                    code: createError.code,
                    details: createError.details
                  })
                  // Wait and retry - trigger might create it
                  if (retries > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                  }
                } else if (newProfile) {
                  // Handle both array and single object responses
                  const profileResult = Array.isArray(newProfile) ? newProfile[0] : newProfile
                  if (profileResult) {
                    console.log('Profile created successfully:', profileResult.id)
                    profile = profileResult
                    break
                  }
                }
              } catch (createErr: any) {
                console.error('Exception creating profile:', createErr?.message || createErr)
                // Wait and retry
                if (retries > 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }
              }
              retries--
            } else {
              // Other error - log it but don't break the flow
              console.warn('Error fetching profile:', error.code || error.message, error)
              // If it's not a "not found" error, break to avoid infinite retries
              break
            }
          } else {
            // No error and no data - shouldn't happen, but break anyway
            break
          }
        }

        setUserProfile(profile)
      } else {
        // No active session, clear user
        setUser(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    // Check for email verification callback
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      // Handle email verification
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User just signed in or session refreshed
        await refreshUser()
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      } else if (event === 'USER_UPDATED') {
        // User updated (e.g., email verified)
        await refreshUser()
      }
    })

    // Also check URL for email verification tokens
    const checkEmailVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await refreshUser()
      }
    }
    
    checkEmailVerification()

    return () => {
      // Cleanup handled by subscription
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

