'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './login.module.css'
import '../globals.css'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className={styles.login_pageContainer}>
      <div className={styles.login_networkImageContainer}>
        <Image
          src="/image/network-background.jpg"
          alt="Network Background"
          width={1200}
          height={675}
          priority
          className={styles.login_networkImage}
        />
      </div>

      <div className={styles.login_orbs}>
        <div className={styles.login_orb}></div>
        <div className={styles.login_orb}></div>
        <div className={styles.login_orb}></div>
        <div className={styles.login_orb}></div>
        <div className={styles.login_orb}></div>
      </div>

      <div className={styles.login_floatingIcons}>
        <div className={styles.login_icon}>📚</div>
        <div className={styles.login_icon}>📊</div>
        <div className={styles.login_icon}>🎓</div>
        <div className={styles.login_icon}>✏️</div>
      </div>

      <div className={styles.login_loginContainer}>
        <div className={styles.login_loginCard}>
          <h1>成绩管理系统</h1>          
          <form onSubmit={handleSubmit} className={styles.login_loginForm}>
            <div className={styles.login_inputGroup}>
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="请输入用户名"
                required
                autoComplete="username"
              />
            </div>
            
            <div className={styles.login_inputGroup}>
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="请输入密码"
                required
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className={styles.login_error}>{error}</div>}
            
            <button
              type="submit"
              className={styles.login_loginButton}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 