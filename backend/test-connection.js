/**
 * DEBUG SCRIPT: Kiểm tra kết nối MongoDB
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n' + '='.repeat(60));
console.log('🔍 KIỂM TRA KẾT NỐI MONGODB');
console.log('='.repeat(60));

console.log('\n📋 Thông tin cấu hình:');
console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`);
console.log(`PORT: ${process.env.PORT}`);

console.log('\n🧪 Thử kết nối MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority'
})
.then(() => {
    console.log('\n✅ KẾT NỐI MONGODB THÀNH CÔNG!');
    console.log(`   📦 Database: ${mongoose.connection.name}`);
    console.log(`   🌐 Host: ${mongoose.connection.host}`);
    console.log(`   📊 Port: ${mongoose.connection.port}`);
    
    // Liệt kê collections
    console.log('\n📚 Collections trong database:');
    mongoose.connection.db.listCollections().toArray((err, collections) => {
        if (err) {
            console.log('   ⚠️  Error:', err.message);
        } else if (collections.length === 0) {
            console.log('   (Chưa có collection nào)');
        } else {
            collections.forEach(collection => {
                console.log(`   - ${collection.name}`);
            });
        }
        
        mongoose.disconnect();
        console.log('\n✅ Đã ngắt kết nối\n');
    });
})
.catch((err) => {
    console.log('\n❌ LỖI KẾT NỐI:');
    console.log(`   Error: ${err.message}`);
    console.log(`\n💡 Giải pháp:
   1. Kiểm tra MongoDB Atlas URL có chính xác không
   2. Kiểm tra IP whitelist trên MongoDB Atlas
   3. Kiểm tra username/password có đúng không
   4. Kiểm tra kết nối internet
   5. Kiểm tra firewall có chặn không`);
    
    mongoose.disconnect();
    console.log('\n');
    process.exit(1);
});
