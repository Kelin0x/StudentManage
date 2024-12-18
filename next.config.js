/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 静态导出
  images: {
    unoptimized: true,
  },
  basePath: '/sms',  // 修改为您的仓库名
}

module.exports = nextConfig 