/**
 * TEST SCRIPT: Xác thực Database - Kiểm tra Login & Bcrypt
 * ====================================================
 * Script này sẽ:
 * 1. Kết nối tới MongoDB Atlas
 * 2. Tạo một user test (nông dân)
 * 3. Kiểm tra password hash với bcryptjs
 * 4. Kiểm tra tìm user trong database
 * 5. Kiểm tra xác thực password
 * 6. Kiểm tra tạo JWT token
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');

// ============ HELPER FUNCTIONS ============
const getJwt = (user) => {
    return jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ============ MAIN TEST ============
async function runTests() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 BẮT ĐẦU KIỂM TRỪ XÁC THỰC DATABASE');
        console.log('='.repeat(60));

        // 1. Kết nối MongoDB
        console.log('\n[1️⃣] Kết nối MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối MongoDB');
        const dbName = mongoose.connection.name;
        const host = mongoose.connection.host;
        console.log(`   📦 Database: ${dbName}`);
        console.log(`   🌐 Host: ${host}`);

        // 2. Xóa user test cũ (nếu có)
        console.log('\n[2️⃣] Làm sạch dữ liệu test cũ...');
        const testEmail = 'test.farmer@agritrace.local';
        await User.deleteOne({ email: testEmail });
        console.log(`✅ Đã xóa user cũ (${testEmail})`);

        // 3. Tạo user test với bcrypt password
        console.log('\n[3️⃣] Tạo user test (nông dân)...');
        const testPassword = 'Test@12345';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        
        console.log(`   📝 Email: ${testEmail}`);
        console.log(`   🔐 Password (plaintext): ${testPassword}`);
        console.log(`   🔒 Password (hashed): ${hashedPassword.substring(0, 30)}...`);

        const newUser = await User.create({
            email: testEmail,
            name: 'Nông Dân Test',
            passwordHash: hashedPassword,
            role: 'FARMER'
        });

        console.log(`✅ User tạo thành công`);
        console.log(`   🆔 ID: ${newUser._id}`);
        console.log(`   👤 Name: ${newUser.name}`);
        console.log(`   👑 Role: ${newUser.role}`);

        // 4. Kiểm tra tìm user từ database
        console.log('\n[4️⃣] Tìm user từ database...');
        const foundUser = await User.findOne({ email: testEmail, role: 'FARMER' });
        
        if (!foundUser) {
            throw new Error('❌ Không tìm thấy user sau khi tạo');
        }
        console.log(`✅ Tìm thấy user`);
        console.log(`   🆔 ID: ${foundUser._id}`);
        console.log(`   ✉️  Email: ${foundUser.email}`);
        console.log(`   👤 Name: ${foundUser.name}`);

        // 5. Kiểm tra password đúng
        console.log('\n[5️⃣] Xác thực password ĐÚNG...');
        const isPasswordCorrect = await bcrypt.compare(testPassword, foundUser.passwordHash);
        
        if (!isPasswordCorrect) {
            throw new Error('❌ Password không khớp');
        }
        console.log(`✅ Password ĐÚNG - Xác thực thành công`);
        console.log(`   🔑 bcrypt.compare("${testPassword}", passwordHash) = true`);

        // 6. Kiểm tra password sai
        console.log('\n[6️⃣] Xác thực password SAI...');
        const isWrongPassword = await bcrypt.compare('WrongPassword123', foundUser.passwordHash);
        
        if (isWrongPassword) {
            throw new Error('❌ Password sai nhưng vẫn khớp');
        }
        console.log(`✅ Password SAI - Đã detect lỗi`);
        console.log(`   🔑 bcrypt.compare("WrongPassword123", passwordHash) = false`);

        // 7. Tạo JWT token
        console.log('\n[7️⃣] Tạo JWT token...');
        const token = getJwt(foundUser);
        console.log(`✅ Token tạo thành công`);
        console.log(`   🎫 Token: ${token.substring(0, 40)}...`);

        // 8. Kiểm tra giải mã JWT token
        console.log('\n[8️⃣] Giải mã JWT token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`✅ Token hợp lệ`);
        console.log(`   🆔 ID từ token: ${decoded.id}`);
        console.log(`   👑 Role từ token: ${decoded.role}`);
        console.log(`   ⏰ Hết hạn trong: ${decoded.exp ? 'OK' : 'ERROR'}`);

        // 9. Kiểm tra token sai
        console.log('\n[9️⃣] Kiểm tra token SAI...');
        try {
            jwt.verify('invalid.token.here', process.env.JWT_SECRET);
            throw new Error('❌ Token sai nhưng vẫn được chấp nhận');
        } catch (err) {
            if (err.message === '❌ Token sai nhưng vẫn được chấp nhận') throw err;
            console.log(`✅ Token SAI - Đã detect lỗi`);
            console.log(`   ⚠️  Error: ${err.message}`);
        }

        // 10. Thống kê kiểm tra
        console.log('\n' + '='.repeat(60));
        console.log('📊 KẾT QUẢ KIỂM TRỪ TOÀN BỘ');
        console.log('='.repeat(60));
        console.log(`
✅ [1] Kết nối MongoDB                     - PASS
✅ [2] Làm sạch dữ liệu test                - PASS
✅ [3] Tạo user + Bcrypt hash              - PASS
✅ [4] Tìm user từ database                 - PASS
✅ [5] Xác thực password ĐÚNG              - PASS
✅ [6] Xác thực password SAI               - PASS
✅ [7] Tạo JWT token                        - PASS
✅ [8] Giải mã JWT token                   - PASS
✅ [9] Kiểm tra token SAI                  - PASS

📈 SUMMARY: 9/9 test cases PASSED ✅
        `);

        console.log('='.repeat(60));
        console.log('🎉 XÁC THỰC DATABASE HOÀN THÀNH THÀNH CÔNG\n');

    } catch (err) {
        console.error('\n❌ LỖI:', err.message);
        console.error('\nStack trace:', err.stack);
    } finally {
        // Đóng kết nối MongoDB
        await mongoose.disconnect();
        console.log('✅ Đã ngắt kết nối MongoDB');
        process.exit(0);
    }
}

// Chạy tests
runTests();
