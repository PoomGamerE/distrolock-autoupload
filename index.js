const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // เปิดเบราว์เซอร์โดยไม่ล็อกขนาดหน้าต่าง
    const browser = await puppeteer.launch({ headless: false });

    // ใช้แท็บปัจจุบัน
    const [page] = await browser.pages();

    // ไปที่หน้าเข้าสู่ระบบ
    await page.goto('https://distrokid.com/signin/?forward=/distrolock');

    // รอจนกว่าจะนำทางไปยังหน้าถัดไป
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // รอจนกว่าจะนำทางไปยังหน้าถัดไป (ซ้ำอีกครั้งเพราะ 2FA)
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // รอจนกว่าจะนำทางไปยังหน้าถัดไป (ซ้ำอีกครั้งเพราะ กด resent ขอ 2FA)
    await page.waitForNavigation({ waitUntil: 'networkidle2' });


    console.log('Logged in and navigated to DistroLock');

    await page.goto('https://distrokid.com/distrolock/new/');

    const folderPath = 'D:\\Your Path\\Your Directory\\Your Folder';  // แก้ไขเป็น path ของโฟลเดอร์ที่เก็บไฟล์ WAV
    const logFile = path.join(folderPath, 'upload_log.txt');
    const logFileError = path.join(__dirname, 'error_log.txt');  // บันทึก error log ไว้ที่โฟลเดอร์เดียวกับที่เปิดโปรแกรม

    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.wav'));

    for (const file of files) {
        try {
            const filePath = path.join(folderPath, file);
            const inputUploadHandle = await page.$('input[name="lockFile"]');
            await inputUploadHandle.uploadFile(filePath);

            const fileNameWithoutExtension = path.basename(file, '.wav');

            await page.type('input[name="lockSongTitle"]', fileNameWithoutExtension);
            await page.type('input[name="lockArtist"]', 'hUSHupMewSICK');

            // เช็ค checkbox เพื่อยอมรับเงื่อนไขการให้บริการ
            const checkboxSelector = 'input.lockCheckbox';
            await page.waitForSelector(checkboxSelector);
            await page.click(checkboxSelector);

            await page.click('input[type="button"].buttonSmall');

            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            console.log(`Uploaded ${file} successfully`);

            // บันทึกสถานะสำเร็จลงใน log
            fs.appendFileSync(logFile, `Uploaded ${file} successfully\n`);

            await page.goto('https://distrokid.com/distrolock/new/');
        } catch (error) {
            console.log(`Error uploading ${file}: ${error.message}`);

            // บันทึกสถานะ error ลงใน log ที่โฟลเดอร์เดียวกับที่เปิดโปรแกรม
            fs.appendFileSync(logFileError, `Error uploading ${file}: ${error.message}\n`);
        }
    }

    await browser.close();
})();
