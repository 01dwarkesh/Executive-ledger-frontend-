'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { authService } from '@/services/auth'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const authResponse = await authService.login({ email, password })
      setUser(authResponse.user)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      if (currentUser) setIsAuthenticated(true)
    } catch {
      // Only clear auth if no token exists
      if (!authService.isAuthenticated()) {
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
