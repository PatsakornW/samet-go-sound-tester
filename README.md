# Samet Go · Sound Tester

หน้าเว็บสำหรับทดสอบเสียงแจ้งเตือน (แชท / การจอง) ของแอป Samet Go
ทั้งหมด 52 เสียง 8 ชุด — สร้างด้วย React + Vite + Tailwind CSS v4

## รันบนเครื่อง

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # ผลลัพธ์อยู่ใน dist/
npm run preview
```

## โครงสร้าง

- `public/sounds/<ชุด>/*.mp3` — ไฟล์เสียงทั้งหมด
- `src/manifest.json` — รายชื่อเสียง ประเภท (chat/booking) ความยาว และคำพูด
- `src/App.jsx` — หน้า UI

เพิ่มเสียงใหม่: วางไฟล์ใน `public/sounds/` แล้วเพิ่มรายการใน `manifest.json`

## Deploy บน GitHub Pages

`vite.config.js` ตั้ง `base: './'` ไว้แล้ว ทำให้ build ใช้ได้กับทุกชื่อ repo
มี workflow ใน `.github/workflows/pages.yml` ที่ build และ deploy อัตโนมัติเมื่อ push ไป `main`
(เปิดใช้ที่ Settings → Pages → Source: GitHub Actions)
