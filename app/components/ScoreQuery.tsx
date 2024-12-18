'use client'

import { useState } from 'react'
import styles from './ScoreQuery.module.css'

interface ScoreQueryProps {
  onSearch: (type: string, value: string) => void
}

export default function ScoreQuery({ onSearch }: ScoreQueryProps) {
  const [queryType, setQueryType] = useState<'student' | 'course'>('student')
  const [queryValue, setQueryValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 输入验证
    if (!queryValue.trim()) {
      setError(queryType === 'student' ? '请输入学号' : '请输入课程编号')
      return
    }

    // 学号格式验证 (6位数字)
    if (queryType === 'student' && !/^\d{7}$/.test(queryValue)) {
      setError('请输入正确的7位学号')
      return
    }

    // 课程编号格式验证 (假设课程编号为CS开头加3位数字)
    if (queryType === 'course' && !/^CS\d{3}$/.test(queryValue)) {
      setError('请输入正确的课程编号（如：CS001）')
      return
    }

    onSearch(queryType, queryValue.trim())
  }

  return (
    <div className={styles.queryContainer}>
      <h2 className={styles.queryTitle}>成绩查询</h2>
      <form className={styles.queryForm} onSubmit={handleSubmit}>
        <div className={styles.queryType}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="student"
              checked={queryType === 'student'}
              onChange={(e) => {
                setQueryType(e.target.value as 'student' | 'course')
                setQueryValue('')
                setError('')
              }}
              className={styles.radioInput}
            />
            <span>按学号查询</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="course"
              checked={queryType === 'course'}
              onChange={(e) => {
                setQueryType(e.target.value as 'student' | 'course')
                setQueryValue('')
                setError('')
              }}
              className={styles.radioInput}
            />
            <span>按课程编号查询</span>
          </label>
        </div>

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

        {error && <div className={styles.error} style={{color: 'red'}}>{error}</div>}
      </form>
    </div>
  )
}