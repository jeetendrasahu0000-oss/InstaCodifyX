import { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]             = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    try {
      const token  = localStorage.getItem('token')
      const stored = localStorage.getItem('user')
      if (token && stored) {
        const parsed = JSON.parse(stored)
        setUser({ ...parsed })
        setIsLoggedIn(true)
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser({ ...userData })
    setIsLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData }
      localStorage.setItem('user', JSON.stringify(merged))
      return merged
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}