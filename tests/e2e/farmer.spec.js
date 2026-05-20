
const { test, expect } = require('@playwright/test');
test.use({
  storageState: 'auth.json'
});

test('E2E - Traceability full flow', async ({ page }) => {

const setupFarmBtn = page.getByRole('button', {
  name: 'Thiết lập Nông trại'
});


// 1. Open frontend
await page.goto('http://localhost:5173');

// 2. Login
await page.getByRole('link', { name: 'Đăng nhập' }).click();
await page.fill('input[type="email"]', 'khoa@gmail.com'); 
await page.fill('input[type="password"]', '123456');
await page.click('button:has-text("Đăng nhập Nông dân")');

// 3. Wait dashboard
await page.waitForLoadState('networkidle');

//4. Thiết lập nông trại
if (await setupFarmBtn.isVisible()) {
  await setupFarmBtn.click();

await expect(
  page.locator('h2')
    .filter({ hasText: 'Thiết lập Nông trại' })
).toBeVisible();

await page.getByPlaceholder(
  'VD: Nông trại xanh'
).fill('Nông trại TEST');

await page.getByPlaceholder(
  'VD: Đà Lạt, Lâm Đồng'
).fill('Địa chỉ TEST');

await page.getByRole('button', {
  name: 'Lưu thông tin'
}).click();

 await page.getByRole('button', {
  name: 'Đóng'
}).click();

  await page.waitForTimeout(1000);
}


 //5. Tạo lô hàng mới 

 
 await page.getByRole('button', {
  name: 'Tạo lô hàng mới'
}).click();

await expect(
  page.locator('h2')
    .filter({ hasText: 'Tạo Lô Hàng Mới' })
).toBeVisible();

 await page.getByRole('button', {
  name: '+ Hoặc tạo sản phẩm mới'
}).click();

await expect(
  page.locator('h2')
    .filter({ hasText: 'Thêm Sản Phẩm Mới' })
).toBeVisible();

await page.getByPlaceholder(
  'VD: Cà chua Cherry'
).fill('TRÁI CÂY TEST');

await page.getByPlaceholder(
  'Đặc tính, loại hạt giống...'
).fill('TRÁI CÂY TEST');

await page.getByRole('button', {
  name: 'Lưu Sản phẩm'
}).click();

await page.getByRole('button', {
  name: 'Đổi sản phẩm'
}).click();


await page.getByPlaceholder(
  'Nhấn vào đây để xem danh sách hoặc gõ tìm...'
).click();

await page.getByPlaceholder(
  'Nhấn vào đây để xem danh sách hoặc gõ tìm...'
).fill('test');

await page.getByText('TRÁI CÂY TEST')
  .first()
  .click();


await page.locator('input[type="date"]')
  .fill('1111-11-11');
  
await page.locator('input[type="number"]')
  .fill('1234');
  
await page.getByRole('button', {
  name: 'Tạo lô hàng',
  exact: true
}).click();

await page.getByRole('button', {
  name: 'Đóng'
}).click();

//6.Thêm hoạt động, hoàn tất rồi đưa cho kiểm định
await page.getByRole('button', {
  name: ' Thêm HĐ'
}).first().click();

await page.getByPlaceholder(
  'VD: Bón phân hữu cơ'
).fill('Hoạt động TEST');

await page.getByPlaceholder(
  'VD: Nhà kính A1'
).fill('Vị trí TEST');

await page.getByRole('button', {
  name: 'Lưu nhật ký'
}).click();

await page.getByRole('button', {
  name: 'Đóng'
}).click();

await page.getByRole('button', {
  name: ' Hoàn tất'
}).first().click();

const input = page
  .getByPlaceholder(/Nhấn vào đây/)
  .first();

await input.click();

await expect(input).toBeFocused();

await input.type('khoa', {
  delay: 150
});

await page.waitForTimeout(1000);

const inspector = page
  .getByText(/^Khoa inspection/)
  .first();

await expect(inspector).toBeVisible();

await inspector.click({ force: true });
await page.getByRole('button', {
  name: 'Gửi yêu cầu'
}).click();

await page.getByRole('button', {
  name: 'Đóng'

}).click();
//7.Đăng xuất 
await page.getByText('Nông dân')
  .first()
  .click();
  
await page.getByRole('button', {
  name: 'Đăng xuất'
}).click();

await page.getByPlaceholder(
  'Nhập mã lô hàng (Ví dụ: 3)'
).fill('69fe1a9046664abd263048c9');

await page.getByRole('button', {
  name: 'Tra cứu ngay'
}).click();

await expect(
  page.getByText(
    '0x4726bE5Ecf122AAe584f628C819707a867379dDF'
  )
).toBeVisible({
  timeout: 60000
});
});

// Cách chạy
// 1. cài playwright
// 2. chạy lệnh "npx playwright test farmer.spec.js" hoặc fullpath 