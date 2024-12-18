'use client'

import styles from './ScoreStatistics.module.css'

interface Statistics {
  average: string
  highest: number
  lowest: number
  totalCourses?: number
  totalStudents?: number
  passRate?: string
}

interface StudentInfo {
  id: string
  name: string
  class: string
  major: string
}

interface ScoreStatisticsProps {
  statistics: Statistics
  type: 'student' | 'course'
  studentInfo?: StudentInfo
}

export default function ScoreStatistics({ statistics, type, studentInfo }: ScoreStatisticsProps) {
  return (
    <div className={styles.container}>
      {type === 'student' && studentInfo && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>个人信息</h3>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>学号</div>
              <div className={`${styles.cardValue} ${styles.id}`}>{studentInfo.id}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>姓名</div>
              <div className={`${styles.cardValue} ${styles.name}`}>{studentInfo.name}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>班级</div>
              <div className={`${styles.cardValue} ${styles.class}`}>{studentInfo.class}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>专业</div>
              <div className={`${styles.cardValue} ${styles.major}`}>{studentInfo.major}</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>成绩统计</h3>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>平均分</div>
            <div className={`${styles.cardValue} ${styles.average}`}>{statistics.average}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>最高分</div>
            <div className={`${styles.cardValue} ${styles.highest}`}>{statistics.highest}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>最低分</div>
            <div className={`${styles.cardValue} ${styles.lowest}`}>{statistics.lowest}</div>
          </div>
          
          {type === 'student' && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>总课程数</div>
              <div className={`${styles.cardValue} ${styles.total}`}>{statistics.totalCourses}</div>
            </div>
          )}
          
          {type === 'course' && (
            <>
              <div className={styles.card}>
                <div className={styles.cardLabel}>总人数</div>
                <div className={`${styles.cardValue} ${styles.total}`}>{statistics.totalStudents}</div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardLabel}>及格率</div>
                <div className={`${styles.cardValue} ${styles.passRate}`}>{statistics.passRate}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 