const app = require("./src/app");
const port = process.env.PORT || 3000;

// Chỉ lắng nghe port khi chạy ở môi trường local (không phải trên Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// BẮT BUỘC: Phải export app để Vercel sử dụng
module.exports = app;