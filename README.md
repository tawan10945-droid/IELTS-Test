# 📚 IELTS Test Platform

A full-stack web application for practicing IELTS tests. This platform allows users to securely register, log in, and take interactive practice exams.

## 🚀 สิ่งที่ระบบนี้ทำได้ (Features)
- **ระบบสมาชิก (Authentication):** สามารถสมัครสมาชิก (Register) และเข้าสู่ระบบ (Login) ได้อย่างปลอดภัย โดยใช้ JWT และการเข้ารหัสรหัสผ่านด้วย bcrypt
- **ระบบจัดการสิทธิ์เข้าถึง (Protected Routes):** หน้า Dashboard และหน้าทำข้อสอบจะเข้าถึงได้เฉพาะผู้ที่เข้าสู่ระบบแล้วเท่านั้น
- **ระบบทำข้อสอบ (Test Interface):** ผู้ใช้สามารถทำข้อสอบ IELTS เสมือนจริง มีอินเทอร์เฟซสำหรับอ่านโจทย์ ตอบคำถาม และตรวจดูเฉลย (Answer Keys) ได้หลังจากทำเสร็จ
- **หน้า แดชบอร์ด (Dashboard):** สรุปข้อมูลผู้ใช้และเป็นศูนย์กลางในการเลือกเข้าทำข้อสอบ
- **ฐานข้อมูลในตัว (Lightweight Database):** ใช้ฐานข้อมูล SQLite เก็บข้อมูลผู้ใช้และผลลัพธ์การทำแบบทดสอบ ทำให้ติดตั้งทับใช้งานได้อย่างรวดเร็ว

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

**Frontend (ระบบหน้าบ้าน):**
- **React 19 (Vite):** ไลบรารีหลักสำหรับการสร้าง User Interface ทำงานได้รวดเร็วด้วย Vite
- **React Router v7:** จัดการเส้นทาง (Routing) ของหน้าเว็บ เช่น นำทางระหว่างหน้า Login ไปยังหน้า Dashboard
- **Axios:** จัดการการเรียกใช้งาน API คุยกับ Backend
- **Lucide React:** ไอคอนที่ทันสมัยและสวยงาม

**Backend (ระบบหลังบ้าน):**
- **Node.js & Express.js:** สร้างเซิร์ฟเวอร์และ API (RESTful) สำหรับจัดการข้อมูลระบบ
- **CORS:** จัดการอนุญาตให้ Frontend และ Backend ที่อยู่คนละ Port สามารถคุยกันได้
- **dotenv:** จัดการการนำเข้า Environment Variables (ตัวแปรสภาพแวดล้อม)

**Database & Security (ฐานข้อมูลและความปลอดภัย):**
- **SQLite3:** ฐานข้อมูลแบบไฟล์ที่สะดวกและไม่ต้องพึ่งพาเซิร์ฟเวอร์ฐานข้อมูลภายนอก
- **JSON Web Token (JWT):** ใช้สร้าง Token เพื่อยืนยันตัวตนของผู้ใช้หลังจาก Login
- **bcryptjs:** เข้ารหัสรหัสผ่านของผู้ใช้ก่อนบันทึกลงฐานข้อมูล เพื่อความปลอดภัยสูงสุด

## 📂 Project Structure
```text
IELTS/
├── frontend/          # React (Vite) application
│   ├── src/           # Components (Login, Register, Dashboard, TestInterface)
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js/Express server
│   ├── routes/        # API route handlers (auth lines, tests)
│   ├── database.js    # SQLite connection configuration
│   └── server.js      # Main server entry file
└── README.md          # Project documentation
```

## 💻 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Backend Setup
Open a terminal and set up the server:
```bash
cd backend
npm install
node server.js
```
The backend server will run on port `5000` (by default).

### 3. Frontend Setup
Open a new terminal session and set up the React client:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start normally at `http://localhost:5173`. Open this URL in your browser to view the app!

---
## ⚙️ การทำ CI/CD (Continuous Integration & Continuous Deployment)

นอกจากการ Deploy ผ่าน Git ปกติแล้ว โครงการนี้ยังสามารถทำงานร่วมกับระบบ CI/CD อย่าง **GitHub Actions** เพื่อทำการทดสอบอัตโนมัติ (Automated Testing) และ Deploy อัตโนมัติได้อีกด้วย

**ตัวอย่างโครงสร้างไฟล์ `deploy.yml` ปัจจุบันสำหรับการทำ GitHub Pages (อยู่ใน `.github/workflows/deploy.yml`):**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main # ให้ทำงานเมื่อมีการ Push โค้ดเข้า branch main

permissions:
  contents: write

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v3

      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json'

      - name: 📦 Install Frontend Dependencies
        working-directory: ./frontend
        run: npm install

      - name: 🏗️ Build Frontend
        working-directory: ./frontend
        run: npm run build

      - name: 🚀 Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```
*Created for IELTS practice and general exam learning.*
