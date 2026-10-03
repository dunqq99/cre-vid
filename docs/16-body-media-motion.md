# 16 — Nhiều tư liệu, lời đọc từng cảnh và chuyển động ảnh

Cập nhật: 02/10/2026.

## Nhập ảnh và video thành Nội dung

Ứng dụng nhận JPG/JPEG, PNG, WebP, MP4 và MOV. Mỗi file tối đa 100 MB; dự án tối đa 50 tư liệu và 30 cảnh. Video đầu vào được kiểm tra, chuẩn hóa về MP4/H.264 30 fps, tối đa 1920 px theo pipeline có sẵn. Không đổi giới hạn tổng thời lượng xuất 180 giây.

Có hai cách dùng:

- **Input → Thêm tư liệu**: chọn nhiều file đưa vào thư viện, sau đó gắn vào cảnh hiện có.
- **Input → Tải nhiều ảnh/video → tạo Nội dung** hoặc **Timeline → Tải ảnh/video tạo cảnh**: chọn nhiều ảnh/video trong cùng một lần. Mỗi file tạo một cảnh Body, giữ thứ tự danh sách chọn và thêm sau các cảnh hiện tại. Không thay hoặc xóa cảnh đã có.

Cảnh mới lấy tên file làm tiêu đề gợi ý, lời đọc để trống để người dùng nhập; không tự suy đoán nội dung ảnh/video. Ảnh mặc định 5 giây, video mặc định tối đa 8 giây hoặc thời lượng clip nếu ngắn hơn, tối thiểu 1 giây. Người dùng điều chỉnh trong Thuộc tính cảnh. Nếu có voice dài hơn, thời lượng thực tế tự kéo dài theo voice như trước.

Từng file nhập và cảnh tạo thành công được lưu ngay. Nếu file sau lỗi, những cảnh trước vẫn được giữ và thông báo nêu số cảnh đã tạo. Kiểm tra số cảnh/tư liệu trước khi bắt đầu để không vượt giới hạn.

## Lời đọc

Chọn cảnh trên Timeline, nhập **Lời đọc của cảnh** trong Thuộc tính cảnh hoặc chỉnh ở bước **Kịch bản**. Nút **Tạo / nhập giọng đọc** mở bước Voice cho đúng cảnh đang chọn. TTS dùng kết nối Vbee/Azure có sẵn; có thể nhập audio riêng. Không tự gọi dịch vụ TTS khi upload. Khi sửa lời đọc, voice cũ không còn khớp sẽ được báo cần cập nhật.

## Chuyển động ảnh

Thuộc tính cảnh → **Hiệu ứng ảnh**:

- Đứng yên (mặc định, cả dữ liệu cũ).
- Zoom in: phóng gần dần.
- Zoom out: từ gần thu về khung gốc.
- Lướt sang trái / phải: chuyển ảnh theo hướng chọn, phóng nhẹ để không hở mép.

**Mức chuyển động** 5–50%, mặc định 15%. Chuyển động tính theo frame trên toàn thời gian cảnh, bao gồm phần kéo dài theo voice. Preview và MP4 dùng cùng phép tính; ảnh nằm trong khung cắt để không tràn lên logo, tiêu đề hoặc phụ đề. Nền mờ phía sau không chuyển động theo ảnh rõ nét. Hiệu ứng này dành cho ảnh; video dùng chuyển động vốn có của clip.

## Tỷ lệ và vị trí video/ảnh

Bố cục Body có thêm **Theo tỷ lệ gốc tư liệu · nền mờ** bên cạnh Đầy khung, 4:3, 1:1. Chế độ gốc giữ đúng tỷ lệ nguồn, ví dụ video 16:9 hoặc video dọc, dùng tư liệu làm mờ ở vùng còn lại. Các cảnh tạo hàng loạt mặc định tỷ lệ gốc và Giữ toàn bộ hình.

- **Phủ đầy khung · cắt phần thừa**: crop nguồn để lấp khung; dùng Vị trí ngang/dọc để chọn vùng giữ lại.
- **Giữ toàn bộ hình**: không cắt nguồn; có thể xuất hiện dải trống trong khung nếu chọn tỷ lệ khác nguồn.
- **Căn giữa tư liệu** đưa X/Y về 50%. Vị trí chỉ có tác dụng trên trục có phần dư hoặc khoảng trống.
- **Vị trí khung tư liệu**: dịch cả cửa sổ rõ nét lên/xuống trong video; dương đẩy lên, âm đẩy xuống, giới hạn ở mép video. Mặc định đẩy lên 8% như bố cục cũ. Khung chiếm toàn chiều cao sẽ không dịch dọc được.
- Video có **Bắt đầu clip** để chọn mốc thời gian đầu và **Tắt tiếng gốc**. Clip ngắn hơn cảnh tiếp tục lặp; nền mờ luôn tắt tiếng để tránh phát âm thanh hai lần.

Các lựa chọn lưu riêng theo cảnh. Khi chia lời đọc thành đoạn ngắn, các cảnh mới giữ hiệu ứng, vị trí và thiết lập tư liệu của cảnh gốc.

## Kiểm chứng

- TypeScript đạt.
- 53 kiểm thử unit/integration đạt, gồm kiểm tra tỷ lệ nguồn, giới hạn vị trí, mặc định/migration, chiều chuyển động và không hở mép khi lướt.
- 15 E2E đạt sau cập nhật định danh hai input upload: 11 đạt ở lượt toàn bộ, 4 bài dùng selector input cũ được sửa và chạy lại đạt.
- E2E thật: upload 2 ảnh + 1 MP4, tạo 3 Body; lời đọc độc lập; cả 4 hiệu ứng thay đổi theo frame; video 16:9 giữ tỷ lệ gốc rồi crop 4:3, vị trí X/Y, dịch khung và mốc bắt đầu; lưu/mở lại giữ cấu hình.
- Render MP4 2 giây nối ảnh zoom với video thật thành công. So sánh dữ liệu pixel ở frame 5 và 25 xác nhận chuyển động ảnh tồn tại trong MP4, không chỉ preview.
- Chưa kiểm thử TTS thật trong lần cập nhật này; chưa chạy lại production build.
