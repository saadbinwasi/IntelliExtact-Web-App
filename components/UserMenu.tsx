'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Coins, Crown, Loader2 } from 'lucide-react'

export default function UserMenu() {
  const { user, userProfile, loading, refreshUser } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    await refreshUser()
    setShowMenu(false)
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/sign-in"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Token Display - Always visible when signed in */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          {userProfile?.tokens_remaining || 0}
        </span>
        <span className="text-xs text-yellow-700 dark:text-yellow-400 hidden sm:inline">tokens</span>
      </div>

      {/* Sign Out Button - Always visible when signed in */}
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userProfile?.full_name || (user.user_metadata?.full_name) || user.email?.split('@')[0] || 'User'}
            </p>
            {userProfile?.subscription_tier === 'pro' && (
              <div className="flex items-center space-x-1">
                <Crown className="w-3 h-3 text-yellow-500" />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Pro</p>
              </div>
            )}
          </div>
        </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                {userProfile?.full_name || (user.user_metadata?.full_name) || 'User'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tokens</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userProfile?.tokens_remaining || 0}
                </span>
              </div>
              {userProfile?.subscription_tier === 'free' && (
                <button className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}

