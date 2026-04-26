/**
 * Stream 5: Test Cập nhật Hành trình Vận chuyển (updateShippingLog)
 * 
 * File này chứa các test case để kiểm tra luồng cập nhật vận chuyển tự động
 * 
 * Chạy: node test-stream5-shipping.js
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// ==========================================
// CẤU HÌNH TESTING
// ==========================================
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const MONGO_URI = process.env.MONGO_URI;

// Test credentials (bạn cần cập nhật các giá trị này)
const TEST_JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'your_jwt_token_here';
const TEST_BATCH_ID = process.env.TEST_BATCH_ID || '507f1f77bcf86cd799439011'; // Thay bằng batch ID thực tế

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTest = (testName, status, details = '') => {
    const timestamp = new Date().toISOString();
    const emoji = status === '✅' ? '✅' : status === '❌' ? '❌' : '⏳';
    console.log(`\n${emoji} [${timestamp}] ${testName}`);
    if (details) console.log(`   📝 ${details}`);
};

const logError = (error) => {
    console.error('   🔴 Error:', error.message);
    if (error.response) {
        console.error('   Response Status:', error.response.status);
        console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
    }
};

// ==========================================
// TEST CASES
// ==========================================

const tests = {
    // Test 1: Happy Path - Cập nhật vận chuyển thành công
    async test_happy_path() {
        logTest('Test 1: Happy Path - Cập nhật vận chuyển thành công', '⏳');
        
        try {
            const payload = {
                location: "Kho lạnh Co.opMart Quận 1",
                status: "Đang nhập kho"
            };

            const response = await axios.post(
                `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                logTest('Test 1: Happy Path - Cập nhật vận chuyển thành công', '✅');
                console.log('   📊 Response:', JSON.stringify(response.data, null, 2));
                return true;
            } else {
                logTest('Test 1: Happy Path - Cập nhật vận chuyển thành công', '❌');
                console.log('   Response:', JSON.stringify(response.data, null, 2));
                return false;
            }
        } catch (error) {
            logTest('Test 1: Happy Path - Cập nhật vận chuyển thành công', '❌');
            logError(error);
            return false;
        }
    },

    // Test 2: Validation - Missing location field
    async test_missing_location() {
        logTest('Test 2: Validation - Missing location field', '⏳');
        
        try {
            const payload = {
                status: "Đang vận chuyển"
                // location is missing
            };

            await axios.post(
                `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logTest('Test 2: Validation - Missing location field', '❌');
            console.log('   ⚠️  Expected 400 error, but request succeeded');
            return false;
        } catch (error) {
            if (error.response && error.response.status === 400) {
                logTest('Test 2: Validation - Missing location field', '✅');
                console.log('   ✅ Correctly rejected with 400 status');
                console.log('   Message:', error.response.data.message);
                return true;
            } else {
                logTest('Test 2: Validation - Missing location field', '❌');
                logError(error);
                return false;
            }
        }
    },

    // Test 3: Validation - Missing status field
    async test_missing_status() {
        logTest('Test 3: Validation - Missing status field', '⏳');
        
        try {
            const payload = {
                location: "Kho lạnh Co.opMart"
                // status is missing
            };

            await axios.post(
                `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logTest('Test 3: Validation - Missing status field', '❌');
            console.log('   ⚠️  Expected 400 error, but request succeeded');
            return false;
        } catch (error) {
            if (error.response && error.response.status === 400) {
                logTest('Test 3: Validation - Missing status field', '✅');
                console.log('   ✅ Correctly rejected with 400 status');
                console.log('   Message:', error.response.data.message);
                return true;
            } else {
                logTest('Test 3: Validation - Missing status field', '❌');
                logError(error);
                return false;
            }
        }
    },

    // Test 4: Validation - Empty location
    async test_empty_location() {
        logTest('Test 4: Validation - Empty location', '⏳');
        
        try {
            const payload = {
                location: "",
                status: "Đang vận chuyển"
            };

            await axios.post(
                `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logTest('Test 4: Validation - Empty location', '❌');
            console.log('   ⚠️  Expected 400 error, but request succeeded');
            return false;
        } catch (error) {
            if (error.response && error.response.status === 400) {
                logTest('Test 4: Validation - Empty location', '✅');
                console.log('   ✅ Correctly rejected with 400 status');
                return true;
            } else {
                logTest('Test 4: Validation - Empty location', '❌');
                logError(error);
                return false;
            }
        }
    },

    // Test 5: Authentication - Missing JWT token
    async test_missing_jwt() {
        logTest('Test 5: Authentication - Missing JWT token', '⏳');
        
        try {
            const payload = {
                location: "Kho lạnh Co.opMart",
                status: "Đang vận chuyển"
            };

            await axios.post(
                `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                        // No Authorization header
                    }
                }
            );

            logTest('Test 5: Authentication - Missing JWT token', '❌');
            console.log('   ⚠️  Expected 401 error, but request succeeded');
            return false;
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logTest('Test 5: Authentication - Missing JWT token', '✅');
                console.log('   ✅ Correctly rejected (Auth failure)');
                return true;
            } else {
                logTest('Test 5: Authentication - Missing JWT token', '❌');
                logError(error);
                return false;
            }
        }
    },

    // Test 6: Invalid Batch ID
    async test_invalid_batch_id() {
        logTest('Test 6: Invalid Batch ID', '⏳');
        
        try {
            const payload = {
                location: "Kho lạnh Co.opMart",
                status: "Đang vận chuyển"
            };

            await axios.post(
                `${API_BASE_URL}/batches/invalid_batch_id/shipping`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logTest('Test 6: Invalid Batch ID', '❌');
            console.log('   ⚠️  Expected 404 error, but request succeeded');
            return false;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                logTest('Test 6: Invalid Batch ID', '✅');
                console.log('   ✅ Correctly returned 404 (Not Found)');
                return true;
            } else {
                logTest('Test 6: Invalid Batch ID', '❌');
                logError(error);
                return false;
            }
        }
    },

    // Test 7: Multiple updates on same batch
    async test_multiple_updates() {
        logTest('Test 7: Multiple updates on same batch', '⏳');
        
        try {
            const updates = [
                { location: "Kho xuất phát", status: "Bắt đầu vận chuyển" },
                { location: "Cảng An Phú", status: "Tại cảng An Phú" },
                { location: "Kho lạnh Co.opMart", status: "Đang nhập kho" }
            ];

            let success = true;
            for (let i = 0; i < updates.length; i++) {
                const response = await axios.post(
                    `${API_BASE_URL}/batches/${TEST_BATCH_ID}/shipping`,
                    updates[i],
                    {
                        headers: {
                            'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.data.success) {
                    success = false;
                    console.log(`   ❌ Update ${i + 1} failed`);
                } else {
                    console.log(`   ✅ Update ${i + 1} success - ${updates[i].location}`);
                }

                // Thêm delay giữa các update để tránh rate limiting
                if (i < updates.length - 1) {
                    await sleep(2000);
                }
            }

            if (success) {
                logTest('Test 7: Multiple updates on same batch', '✅');
                return true;
            } else {
                logTest('Test 7: Multiple updates on same batch', '❌');
                return false;
            }
        } catch (error) {
            logTest('Test 7: Multiple updates on same batch', '❌');
            logError(error);
            return false;
        }
    }
};

// ==========================================
// RUN ALL TESTS
// ==========================================

async function runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('  🧪 STREAM 5: SHIPPING UPDATE TESTS');
    console.log('='.repeat(70));
    console.log(`\n📋 Configuration:`);
    console.log(`   API Base URL: ${API_BASE_URL}`);
    console.log(`   Test Batch ID: ${TEST_BATCH_ID}`);
    console.log(`   JWT Token: ${TEST_JWT_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`\n⚠️  NOTE: Ensure TEST_BATCH_ID points to a MINTED batch with valid tokenId!\n`);

    const results = [];
    
    // Run tests
    results.push(await tests.test_happy_path());
    await sleep(1000);
    
    results.push(await tests.test_missing_location());
    await sleep(500);
    
    results.push(await tests.test_missing_status());
    await sleep(500);
    
    results.push(await tests.test_empty_location());
    await sleep(500);
    
    results.push(await tests.test_missing_jwt());
    await sleep(500);
    
    results.push(await tests.test_invalid_batch_id());
    await sleep(500);
    
    // results.push(await tests.test_multiple_updates()); // Comment out if not testing multiple updates
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('  📊 TEST SUMMARY');
    console.log('='.repeat(70));
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    const percentage = ((passed / total) * 100).toFixed(2);
    
    console.log(`\n✅ Passed: ${passed}/${total} (${percentage}%)`);
    console.log(`❌ Failed: ${total - passed}/${total}\n`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Stream 5 is ready for production.\n');
    } else {
        console.log('⚠️  Some tests failed. Please review the logs above.\n');
    }
    
    console.log('='.repeat(70) + '\n');
}

// ==========================================
// MAIN
// ==========================================

if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = tests;
