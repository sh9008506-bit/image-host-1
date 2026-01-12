// server.js - ပထမဆုံး server file

// 1. လိုအပ်တဲ့ packages တွေ ခေါ်သုံးခြင်း
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 2. Express app ဖန်တီးခြင်း
const app = express();
const PORT = 3001; // port number သတ်မှတ်ခြင်း

// 3. 'uploads' ဖိုလ်ဒာ ရှိမရှိ စစ်ဆေးခြင်း
// မရှိရင် ဖန်တီးပေးခြင်း
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('uploads folder ဖန်တီးပြီးပါပြီ');
}

// 4. Multer ကို သတ်မှတ်ခြင်း (ပုံတွေ ဘယ်လိုသိမ်းမလဲ)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // ပုံတွေကို 'uploads' ဖိုလ်ဒာထဲသိမ်းမယ်
    },
    filename: function (req, file, cb) {
        // ပုံနာမည်ကို unique ဖြစ်အောင် လုပ်မယ်
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// 5. File filter - ဘယ်လို file မျိုးတွေကို လက်ခံမလဲ
const fileFilter = (req, file, cb) => {
    // image files ပဲ လက်ခံမယ်
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('ပုံဖိုင်အမျိုးအစားသာ တင်ပါ'));
    }
};

// 6. Upload setting
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// 7. Static files များကို serve လုပ်ခြင်း
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 8. Routes များ သတ်မှတ်ခြင်း

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'ဖိုင်ရွေးပါ' });
        }
        
        // Image URL ဖန်တီးခြင်း
        const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        
        // Success response
        res.json({
            success: true,
            message: 'ပုံတင်ပြီးပါပြီ!',
            filename: req.file.filename,
            url: imageUrl,
            size: (req.file.size / 1024).toFixed(2) + ' KB'
        });
    } catch (error) {
        res.status(500).json({ error: 'တင်ရန် မအောင်မြင်ပါ' });
    }
});

// 9. Server စတင်ခြင်း
app.listen(PORT, () => {
    console.log(`✅ Server စတင်ပြီး: http://localhost:${PORT}`);
    console.log(`📁 Uploads folder: ${__dirname}/uploads`);
});
// Multiple upload အတွက်
const uploadMultiple = multer({ storage: storage }).array('images', 10); // max 10 files

app.post('/upload-multiple', uploadMultiple, (req, res) => {
    // Handle multiple files
});