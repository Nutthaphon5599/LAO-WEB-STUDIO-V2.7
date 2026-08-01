# Lao Web Studio V4 — Supabase

## ตั้งค่า 4 ขั้นตอน
1. สร้าง Project ที่ Supabase แล้วเปิด **SQL Editor** วางโค้ดจาก `supabase-setup.sql` และกด Run
2. ไปที่ **Authentication > Users > Add user** สร้าง Email/Password สำหรับ Admin
3. ไปที่ **Project Settings > API** คัดลอก Project URL และ anon public key ใส่ใน `supabase-config.js`
4. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub/Netlify แล้วเข้า `admin.html` เพื่อ Login

## ผลลัพธ์
- เปลี่ยนราคาแล้วทุกคนเห็นทันที
- เพิ่ม แก้ไข ลบผลงานได้สูงสุด 6 รายการ
- รูปผลงานเก็บใน Supabase Storage
- หน้า Admin ป้องกันด้วย Email/Password

ห้ามนำ `service_role` key ใส่ในเว็บไซต์ ใช้เฉพาะ `anon public` key เท่านั้น


## V2.1 Customer CRM

เพิ่มระบบรับลูกค้าผ่าน Supabase:
- แบบฟอร์มขอใบเสนอราคาที่หน้าเว็บไซต์
- ตาราง `leads` สำหรับเก็บข้อมูลลูกค้า
- หน้า Admin แสดง ค้นหา และกรองลูกค้า
- เปลี่ยนสถานะ `New`, `Contacted`, `Completed`
- ปุ่มติดต่อ WhatsApp และลบรายการ

### อัปเดตฐานข้อมูล
เปิด Supabase > SQL Editor แล้วรันไฟล์ `supabase-setup.sql` อีกครั้ง จากนั้นตรวจสอบว่ามีตาราง `leads`
