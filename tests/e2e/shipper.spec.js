const { test, expect } = require('@playwright/test');
test('shipper flow', async ({ page }) => {
// 1. Open frontend
await page.goto('http://localhost:5173');

// 2. Login
await page.getByRole('link', { name: 'Đăng nhập' }).click();
await page.getByRole('button', { name: 'Vận chuyển' }).click();
await page.fill('input[type="email"]', 'khoaship@gmail.com'); 
await page.fill('input[type="password"]', '123456');
await page.click('button:has-text("Đăng nhập Vận chuyển")');
// 3. Tìm lô hàng 
await page.getByPlaceholder('Nhập mã lô hàng (Batch ID)...').fill('69fe1a9046664abd263048c9'); //nhập lô hay dùng để test bởi tác giả
await page.click('button:has-text("Tìm kiếm")');
// 4. Thêm nhật ký
await page.click('button:has-text("Thêm nhật ký")');
await page.getByPlaceholder('VD: Kho lạnh Co.opMart Quận 1, TP.HCM').fill('TEST LOCATION');
await page.locator('#status').selectOption({ label: '🚚 Bắt đầu vận chuyển' }); //ô chọn có id status
await page.click('button:has-text("Hủy")');
await page.click('button:has-text("Thêm nhật ký")');
await page.getByPlaceholder('VD: Kho lạnh Co.opMart Quận 1, TP.HCM').fill('TEST LOCATION');
await page.locator('#status').selectOption({ label: '🚚 Bắt đầu vận chuyển' }); //ô chọn có id status
await page.click('button:has-text("Cập nhật vận chuyển")');
await page.getByText(/Cập nhật .* thành công/).waitFor();
// 5.Đăng xuất
await page.locator('img[alt="avatar"]').click();
await page.getByRole('button', {name: 'Đăng xuất'}).click();

});

// Cách chạy
// 1. cài playwright
// 2. chạy lệnh "npx playwright test shipper.spec.js" hoặc fullpath 