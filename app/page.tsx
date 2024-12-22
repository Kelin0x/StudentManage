'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import ScoreQuery from './components/ScoreQuery'
import { useSession, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Role } from '@prisma/client'

interface Student {
  id: number
  studentId: string
  name: string
  gender: string
  major: string
  grade: number
  scores: Score[]
}

interface Score {
  id: number
  score: number
  courseId: string
  course: Course
}

interface Course {
  id: number
  courseId: string
  courseName: string
  teacher: string
}

interface QueryResult {
  statistics: {
    average?: number;
    highest?: number;
    lowest?: number;
    count?: number;
    passRate?: string;
  };
  scores: Array<{
    id: number;
    score: number;
    course?: {
      courseId: string;
      courseName: string;
      teacher: string;
    };
    student?: {
      studentId: string;
      name: string;
      major: string;
    };
  }>;
  studentInfo?: {
    name: string;
    studentId: string;
    major: string;
  };
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null)
  const [queryType, setQueryType] = useState<'student' | 'course'>('student')
  const { data: session } = useSession() as { data: Session | null }
  const [userRole, setUserRole] = useState<Role | null>(null)

  console.log('Session user:', {
    id: session?.user?.id,
    name: session?.user?.name,
    role: session?.user?.role,
    username: session?.user?.username,
    token: session
  })

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user?.username || session?.user?.name) {
        try {
          const queryParam = session.user.username || session.user.name
          const response = await fetch(`/api/users?username=${queryParam}`)
          const data = await response.json()
          if (data.role) {
            setUserRole(data.role)
            console.log('获取到用户角色:', data.role)
          }
        } catch (error) {
          console.error('获取用户角色失败:', error)
        }
      }
    }

    fetchUserRole()
  }, [session?.user?.username, session?.user?.name])

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (userRole) params.append('role', userRole)
      if (session?.user?.username) params.append('username', session.user.username)

      const response = await fetch(`/api/students?${params.toString()}`)
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('获取学生数据失败:', error)
    }
  }, [userRole, session?.user?.username])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSearch = async (type: string, value: string) => {
    try {
      if (userRole === Role.STUDENT && 
          (type === 'student' && value !== session?.user?.username)) {
        console.error('无权限查看其他学生信息');
        return;
      }

      if (!value.trim()) {
        console.error('请输入查询值');
        return;
      }

      const response = await fetch(`/api/scores?${type}Id=${encodeURIComponent(value)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("返回的数据不是 JSON 格式!");
      }

      const data = await response.json();
      setQueryResults(data);
      setQueryType(type as 'student' | 'course');
      
    } catch (error) {
      console.error('查询出错:', error);
      setQueryResults(null);
    }
  };

  const handleQueryTypeChange = (type: 'student' | 'course') => {
    setQueryType(type);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <main className={styles.main}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>学生成绩管理系统</h1>
        </div>
        <nav className={styles.nav}>
          <div 
            className={`${styles.navItem} ${queryType === 'student' ? styles.navItemActive : ''}`}
            onClick={() => handleQueryTypeChange('student')}
          >
            <span className={styles.navIcon}>👨‍🎓</span>
            <span>按学号查询</span>
          </div>
          <div 
            className={`${styles.navItem} ${queryType === 'course' ? styles.navItemActive : ''}`}
            onClick={() => handleQueryTypeChange('course')}
          >
            <span className={styles.navIcon}>📚</span>
            <span>按课程查询</span>
          </div>
        </nav>
      </aside>
      
      <div className={styles.rightContent}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>成绩管理系统</h1>
            <div className={styles.breadcrumb}>
              / 成绩总览
            </div>
          </div>
          {session && (
            <div className={styles.userInfo}>
              <div className={styles.userProfile}>
                <span className={styles.userIcon}>👤</span>
                <span className={styles.userName}>{session.user?.name}</span>
                <span className={styles.role}>{userRole}</span>
              </div>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          )}
        </header>

        <div className={styles.content}>
          {!session ? (
            <div className={styles.loginPrompt}>
              <h2>欢迎使用学生成绩管理系统</h2>
              <p>请登录以访问完整功能</p>
            </div>
          ) : (
            <>
              <div className={styles.statsCards}>
                <div className={styles.statsCard}>
                  <div className={styles.label}>总学生数</div>
                  <div className={styles.value}>{students.length}</div>
                </div>
                <div className={styles.statsCard}>
                  <div className={styles.label}>平均分</div>
                  <div className={styles.value}>
                    {queryResults?.statistics.average 
                      ? Number(queryResults.statistics.average).toFixed(1) 
                      : '-'}
                  </div>
                </div>
                <div className={styles.statsCard}>
                  <div className={styles.label}>及格率</div>
                  <div className={styles.value}>
                    {queryResults?.statistics.passRate || '-'}
                  </div>
                </div>
                <div className={styles.statsCard}>
                  <div className={styles.label}>最高分</div>
                  <div className={styles.value}>
                    {queryResults?.statistics.highest || '-'}
                  </div>
                </div>
              </div>

              {(userRole === Role.ADMIN || userRole === Role.TEACHER) && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>成绩查询</h3>
                  <ScoreQuery 
                    onSearch={handleSearch} 
                    queryType={queryType}
                    onQueryTypeChange={handleQueryTypeChange}
                  />
                </div>
              )}

              <section className={styles.resultsSection}>
                {queryResults && (
                  <div className={styles.queryResults}>
                    {/* 统计信息卡片 */}
                    <div className={styles.statsCards}>
                      <div className={styles.statsCard}>
                        <div className={styles.label}>平均分</div>
                        <div className={styles.value}>
                          {queryResults.statistics.average 
                            ? Number(queryResults.statistics.average).toFixed(1) 
                            : '-'}
                        </div>
                      </div>
                      <div className={styles.statsCard}>
                        <div className={styles.label}>最高分</div>
                        <div className={styles.value}>
                          {queryResults.statistics.highest || '-'}
                        </div>
                      </div>
                      <div className={styles.statsCard}>
                        <div className={styles.label}>最低分</div>
                        <div className={styles.value}>
                          {queryResults.statistics.lowest || '-'}
                        </div>
                      </div>
                      <div className={styles.statsCard}>
                        <div className={styles.label}>及格率</div>
                        <div className={styles.value}>
                          {queryResults.statistics.passRate || '-'}
                        </div>
                      </div>
                    </div>

                    {/* 学生信息（仅在按学号查询时显示） */}
                    {queryType === 'student' && queryResults.studentInfo && (
                      <div className={styles.studentInfo}>
                        <h3 className={styles.cardTitle}>学生信息</h3>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>姓名：</span>
                            <span>{queryResults.studentInfo.name}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>专业：</span>
                            <span>{queryResults.studentInfo.major}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 成绩列表 */}
                    <div className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        {queryType === 'student' ? '课程成绩列表' : '学生成绩列表'}
                      </h3>
                      <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              {queryType === 'student' ? (
                                <>
                                  <th>课程编号</th>
                                  <th>课程名称</th>
                                  <th>任课教师</th>
                                  <th>成绩</th>
                                </>
                              ) : (
                                <>
                                  <th>学号</th>
                                  <th>姓名</th>
                                  <th>专业</th>
                                  <th>成绩</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResults.scores.map((score) => (
                              <tr key={score.id}>
                                {queryType === 'student' ? (
                                  <>
                                    <td>{score.course?.courseId}</td>
                                    <td>{score.course?.courseName}</td>
                                    <td>{score.course?.teacher}</td>
                                    <td className={styles.score}>
                                      {score.score}
                                      <span className={styles.scoreStatus}>
                                        {score.score >= 60 ? '及格' : '不及格'}
                                      </span>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td>{score.student?.studentId}</td>
                                    <td>{score.student?.name}</td>
                                    <td>{score.student?.major}</td>
                                    <td className={styles.score}>
                                      {score.score}
                                      <span className={styles.scoreStatus}>
                                        {score.score >= 60 ? '及格' : '不及格'}
                                      </span>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>学生信息</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>学号</th>
                        <th>姓名</th>
                        <th>性别</th>
                        <th>专业</th>
                        <th>年级</th>
                        <th>课程成绩</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 根据角色显示不同的数据 */}
                      {userRole === Role.STUDENT ? (
                        // 学生只显示自己的信息
                        students
                          .filter(student => student.name === session?.user?.name)
                          .map((student) => (
                            <tr key={student.id}>
                              <td>{student.studentId}</td>
                              <td>{student.name}</td>
                              <td>{student.gender}</td>
                              <td>{student.major}</td>
                              <td>{student.grade}</td>
                              <td className={styles.scoresList}>
                                {student.scores.map((score) => (
                                  <div key={score.id} className={styles.scoreItem}>
                                    {score.course.courseName}: {score.score}分
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))
                      ) : (
                        // 教师和管理员显示所有学生信息
                        students.map((student) => (
                          <tr key={student.id}>
                            <td>{student.studentId}</td>
                            <td>{student.name}</td>
                            <td>{student.gender}</td>
                            <td>{student.major}</td>
                            <td>{student.grade}</td>
                            <td className={styles.scoresList}>
                              {student.scores.map((score) => (
                                <div key={score.id} className={styles.scoreItem}>
                                  {score.course.courseName}: {score.score}分
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
} 