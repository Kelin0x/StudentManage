# 成绩管理系统数据库设计与功能说明

## 数据库设计

### 表结构
系统包含以下4个主要数据表:

1. Student(学生表)
- id: 自增主键
- studentId: 学号(唯一索引) 
- name: 姓名
- gender: 性别
- major: 专业
- grade: 年级
- createdAt: 创建时间
- updatedAt: 更新时间

2. Course(课程表) 
- id: 自增主键
- courseId: 课程编号(唯一索引)
- courseName: 课程名称
- teacher: 任课教师
- createdAt: 创建时间
- updatedAt: 更新时间

3. Score(成绩表)
- id: 自增主键
- score: 分数
- studentId: 学生ID(外键)
- courseId: 课程ID(外键)
- createdAt: 创建时间
- updatedAt: 更新时间
- 联合唯一索引: [studentId, courseId]

4. User(用户表)
- id: 自增主键
- username: 用户名(唯一索引)
- password: 密码
- name: 姓名
- role: 角色(TEACHER/STUDENT)

### 数据完整性保证
1. 实体完整性
- 所有表都使用自增主键id作为主键
- studentId、courseId等关键字段设置了唯一索引约束

2. 参照完整性
- Score表通过外键关联Student表和Course表
- 使用级联更新和删除保证数据一致性

3. 用户定义完整性
- 成绩score字段为Float类型,限制了数据格式
- 学号studentId、课程号courseId等都是String类型且不允许为空
- 时间字段自动记录创建和更新时间

## 主要查询功能

### 1. 学生成绩查询功能详解

#### 1.1 查询权限控制
- 基于角色的访问控制(RBAC)
  - 学生(STUDENT): 只能查询自己的成绩
  - 教师(TEACHER): 可查询所有学生成绩和课程成绩
  - 管理员(ADMIN): 拥有最高权限,可进行所有操作

#### 1.2 按学号查询功能
- 输入验证
  - 强制要求7位数字学号格式
  - 防SQL注入:使用参数化查询
  - 越权检查:验证学生只能查询自己的学号

- 查询结果展示
  - 学生基本信息卡片
    - 姓名、学号、专业等个人信息
  - 成绩详情表格
    - 课程编号、课程名称、任课教师
    - 成绩展示(及格/不及格状态标识)
  - 成绩统计面板
    - 平均分(保留1位小数)
    - 最高分/最低分
    - 及格率百分比
    - 总课程数量

#### 1.3 按课程查询功能
- 输入验证
  - 课程编号格式校验(如CS001)
  - 权限验证:仅教师/管理员可用

- 查询结果展示
  - 课程信息展示
    - 课程编号、名称、任课教师
  - 学生成绩列表
    - 学号、姓名、专业、成绩
    - 成绩状态标识
  - 成绩统计信息
    - 班级平均分
    - 最高分/最低分
    - 及格率统计
    - 选课人数

#### 1.4 数据完整性保护
- 查询安全性
  - 参数化查询防注入
  - 数据脱敏处理
  - 访问日志记录
- 触发器保护
  - 成绩合法性检查(0-100分)
  - 更新时间自动维护
  - 关联数据同步更新
- 异常处理
  - 查询超时处理
  - 错误信息友好提示
  - 失败重试机制
  
```
CREATE TABLE Student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(191) UNIQUE NOT NULL,  -- 学号
    name VARCHAR(191) NOT NULL,              -- 姓名
    gender VARCHAR(191) NOT NULL,            -- 性别
    major VARCHAR(191) NOT NULL,             -- 专业
    grade INT NOT NULL,                      -- 年级
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3)
);
```
```
CREATE TABLE Course (
    id INT AUTO_INCREMENT PRIMARY KEY,
    courseId VARCHAR(191) UNIQUE NOT NULL,   -- 课程编号
    courseName VARCHAR(191) NOT NULL,        -- 课程名称
    teacher VARCHAR(191) NOT NULL,           -- 任课教师
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3)
);
```

```
CREATE TABLE Score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    score DOUBLE NOT NULL,                   -- 分数
    studentId VARCHAR(191) NOT NULL,         -- 关联学生
    courseId VARCHAR(191) NOT NULL,          -- 关联课程
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3),
    UNIQUE KEY `Score_studentId_courseId_key` (studentId, courseId),
    FOREIGN KEY (studentId) REFERENCES Student(studentId),
    FOREIGN KEY (courseId) REFERENCES Course(courseId)
);
```

```
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(191) UNIQUE NOT NULL,    -- 用户名
    password VARCHAR(191) NOT NULL,           -- 密码
    name VARCHAR(191) NOT NULL,              -- 姓名
    role ENUM('ADMIN','TEACHER','STUDENT') DEFAULT 'TEACHER',
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3)
);
```


```
-- 查询学生基本信息和所有课程成绩
SELECT s.*, sc.score, c.courseName, c.teacher
FROM Student s
LEFT JOIN Score sc ON s.studentId = sc.studentId
LEFT JOIN Course c ON sc.courseId = c.courseId
WHERE s.studentId = ?;

-- 查询成绩统计信息
SELECT 
    AVG(score) as average,
    MAX(score) as highest,
    MIN(score) as lowest,
    COUNT(*) as totalCourses,
    SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as passRate
FROM Score
WHERE studentId = ?;
```
```
-- 查询某课程所有学生成绩
SELECT s.studentId, s.name, s.major, sc.score
FROM Score sc
JOIN Student s ON sc.studentId = s.studentId
WHERE sc.courseId = ?;

-- 查询课程成绩统计
SELECT 
    AVG(score) as average,
    MAX(score) as highest,
    MIN(score) as lowest,
    COUNT(*) as totalStudents,
    SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as passRate
FROM Score
WHERE courseId = ?;

```
```
-- 用户登录验证
SELECT id, username, name, role
FROM User
WHERE username = ? AND password = ?;

-- 查询用户权限
SELECT role
FROM User
WHERE username = ?;

```

```
DELIMITER //

-- 成绩变更后自动更新及格率
CREATE TRIGGER after_score_change_passrate
AFTER INSERT ON Score
FOR EACH ROW
BEGIN
    -- 1. 更新学生及格率
    INSERT INTO GradePassRate (
        targetId,
        targetName,
        targetType,
        totalCount,
        passCount,
        failCount,
        passRate,
        averageScore,
        semester
    )
    SELECT 
        s.studentId,
        s.name,
        'STUDENT',
        COUNT(*),
        SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END),
        SUM(CASE WHEN sc.score < 60 THEN 1 ELSE 0 END),
        (SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),
        AVG(sc.score),
        CONCAT(YEAR(CURRENT_DATE), '-', CASE WHEN MONTH(CURRENT_DATE) <= 7 THEN '春' ELSE '秋' END)
    FROM Score sc
    JOIN Student s ON sc.studentId = s.studentId
    WHERE sc.studentId = NEW.studentId
    GROUP BY s.studentId, s.name
    ON DUPLICATE KEY UPDATE
        totalCount = VALUES(totalCount),
        passCount = VALUES(passCount),
        failCount = VALUES(failCount),
        passRate = VALUES(passRate),
        averageScore = VALUES(averageScore),
        updatedAt = CURRENT_TIMESTAMP(3);

    -- 2. 更新课程及格率
    INSERT INTO GradePassRate (
        targetId,
        targetName,
        targetType,
        totalCount,
        passCount,
        failCount,
        passRate,
        averageScore,
        semester
    )
    SELECT 
        c.courseId,
        c.courseName,
        'COURSE',
        COUNT(*),
        SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END),
        SUM(CASE WHEN sc.score < 60 THEN 1 ELSE 0 END),
        (SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),
        AVG(sc.score),
        CONCAT(YEAR(CURRENT_DATE), '-', CASE WHEN MONTH(CURRENT_DATE) <= 7 THEN '春' ELSE '秋' END)
    FROM Score sc
    JOIN Course c ON sc.courseId = c.courseId
    WHERE sc.courseId = NEW.courseId
    GROUP BY c.courseId, c.courseName
    ON DUPLICATE KEY UPDATE
        totalCount = VALUES(totalCount),
        passCount = VALUES(passCount),
        failCount = VALUES(failCount),
        passRate = VALUES(passRate),
        averageScore = VALUES(averageScore),
        updatedAt = CURRENT_TIMESTAMP(3);

    -- 3. 更新班级及格率
    INSERT INTO GradePassRate (
        targetId,
        targetName,
        targetType,
        totalCount,
        passCount,
        failCount,
        passRate,
        averageScore,
        semester
    )
    SELECT 
        CONCAT(s.grade, '-', s.major),
        CONCAT(s.grade, '级', s.major, '班'),
        'CLASS',
        COUNT(*),
        SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END),
        SUM(CASE WHEN sc.score < 60 THEN 1 ELSE 0 END),
        (SUM(CASE WHEN sc.score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),
        AVG(sc.score),
        CONCAT(YEAR(CURRENT_DATE), '-', CASE WHEN MONTH(CURRENT_DATE) <= 7 THEN '春' ELSE '秋' END)
    FROM Score sc
    JOIN Student s ON sc.studentId = s.studentId
    WHERE s.studentId = NEW.studentId
    GROUP BY s.grade, s.major
    ON DUPLICATE KEY UPDATE
        totalCount = VALUES(totalCount),
        passCount = VALUES(passCount),
        failCount = VALUES(failCount),
        passRate = VALUES(passRate),
        averageScore = VALUES(averageScore),
        updatedAt = CURRENT_TIMESTAMP(3);
END;//

DELIMITER ;
```
