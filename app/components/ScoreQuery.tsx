'use client'

import { useState } from 'react'
import styles from './ScoreQuery.module.css'

interface ScoreQueryProps {
  onSearch: (type: string, value: string) => void
  queryType: 'student' | 'course'
  onQueryTypeChange: (type: 'student' | 'course') => void
}

export default function ScoreQuery({ onSearch, queryType, onQueryTypeChange }: ScoreQueryProps) {
  const [queryValue, setQueryValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!queryValue.trim()) {
      setError(queryType === 'student' ? '请输入学号' : '请输入课程编号')
      return
    }

    if (queryType === 'student' && !/^\d{7}$/.test(queryValue)) {
      setError('请输入正确的7位学号')
      return
    }

    if (queryType === 'course' && !/^CS\d{3}$/.test(queryValue)) {
      setError('请输入正确的课程编号（如：CS001）')
      return
    }

    onSearch(queryType, queryValue.trim())
  }

  return (
    <div className={styles.queryContainer}>
      <div className={styles.queryTypeSelector}>
        <button
          className={`${styles.typeButton} ${queryType === 'student' ? styles.active : ''}`}
          onClick={() => {
            onQueryTypeChange('student')
            setQueryValue('')
            setError('')
          }}
        >
          <span className={styles.icon}>👨‍🎓</span>
          按学号查询
        </button>
        <button
          className={`${styles.typeButton} ${queryType === 'course' ? styles.active : ''}`}
          onClick={() => {
            onQueryTypeChange('course')
            setQueryValue('')
            setError('')
          }}
        >
          <span className={styles.icon}>📚</span>
          按课程查询
        </button>
      </div>

      <form className={styles.queryForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={queryValue}
            onChange={(e) => {
              setQueryValue(e.target.value)
              setError('')
            }}
            placeholder={queryType === 'student' ? '请输入学号（7位数字）' : '请输入课程编号（如：CS001）'}
            className={styles.queryInput}
          />
          <button type="submit" className={styles.queryButton}>
            查询
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  )
}