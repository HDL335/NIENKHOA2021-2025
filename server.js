const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware cookie
app.use(cookieParser());

// Phục vụ file tĩnh qua /static để kiểm soát rõ hơn
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// Middleware xác minh "người dùng thật"
app.use((req, res, next) => {
  const allowed = ['/uam.html', '/verify', '/static/', '/files/', '/list', '/upload'];

  // Nếu đã xác minh hoặc truy cập tài nguyên được phép
  if (
    req.cookies.uam_verified === '1' ||
    allowed.some(path => req.path.startsWith(path))
  ) {
    return next();
  }

  // Nếu chưa xác minh, chuyển về trang UAM
  return res.redirect('/uam.html');
});

// Trả về trang index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Trả về trang UAM
app.get('/uam.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/uam.html'));
});

// Trả về danh sách file
app.get('/list', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) return res.status(500).send('Lỗi đọc file');
    res.json(files);
  });
});

// Upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });
app.post('/upload', upload.array('files', 1000), (req, res) => {
  res.redirect('/');
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`📦 Server đang chạy tại: http://localhost:${PORT}`);
});

