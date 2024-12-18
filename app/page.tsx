'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import ScoreQuery from './components/ScoreQuery'
import ScoreStatistics from './components/ScoreStatistics'
import { useSession } from 'next-auth/react'
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

  return (
    <main className={styles.main}>
      {!session ? (
        <div className={styles.loginPrompt}>
          <h2>欢迎使用学生成绩管理系统</h2>
          <p>请登录以访问完整功能</p>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <div className={styles.titleSection}>
              <h1>学生成绩管理系统</h1>
              <div className={styles.userInfo}>
                {session.user?.name}
                <span className={styles.role}>{userRole}</span>
                {process.env.NODE_ENV === 'development' && (
                  <pre style={{ display: 'none' }}>
                    {JSON.stringify(session?.user, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </header>

          <div className={styles.content}>
            {(userRole === Role.ADMIN || userRole === Role.TEACHER) && (
              <section className={styles.querySection}>
                <ScoreQuery onSearch={handleSearch} />
              </section>
            )}

            <section className={styles.resultsSection}>
              {queryResults && (
                <div className={styles.queryResults}>
                  <ScoreStatistics 
                    statistics={{
                      average: queryResults.statistics.average?.toString() ?? '',
                      highest: queryResults.statistics.highest?.toString() ?? '',
                      lowest: queryResults.statistics.lowest?.toString() ?? '',
                      count: queryResults.statistics.count?.toString() ?? '',
                      totalCourses: queryResults.scores.length.toString(),
                      totalStudents: queryType === 'course' ? 
                        queryResults.statistics.count?.toString() ?? '' :  // 课程查询时使用 count 作为总人数
                        queryResults.statistics.count?.toString() ?? '',
                      passRate: queryResults.statistics.passRate?.toString() ?? '0%'
                    }}
                    type={queryType}
                    studentInfo={queryResults.studentInfo}
                  />
                  
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {queryType === 'student' ? (
                            <>
                              <th>课程编号</th>
                              <th>课程名称</th>
                              <th>任课教师</th>
                            </>
                          ) : (
                            <>
                              <th>学号</th>
                              <th>姓名</th>
                              <th>专业</th>
                            </>
                          )}
                          <th>成绩</th>
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
                              </>
                            ) : (
                              <>
                                <td>{score.student?.studentId}</td>
                                <td>{score.student?.name}</td>
                                <td>{score.student?.major}</td>
                              </>
                            )}
                            <td>{score.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className={styles.studentsSection}>
                <h2>学生信息</h2>
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
              
            
              </section>
          </div>
        </>
      )}
    </main>
  )
} 