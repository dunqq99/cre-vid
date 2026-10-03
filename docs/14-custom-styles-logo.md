# 14 — Logo 1000%, bo tròn và giao diện từ ảnh

> Cập nhật hành vi nhận diện Body và xem thử nền tảng ngày 01/10: xem [tài liệu 15](15-overlay-corrections.md).
Ngày: 30/09/2026.

## Logo

Studio → Nhận diện thương hiệu:

- **Kích cỡ tên thương hiệu**: 50–300%, riêng với logo; tên dài tự co để vừa khung. Dải nửa viên thuốc của mẫu Xanh bản đồ cao theo chữ.
- **Kích cỡ logo**: 50–1000%, đặt lại 100%. Kích thước thực tế bị giới hạn bởi chiều rộng/chiều cao vùng nhận diện để không cắt logo hoặc đẩy tên ra khỏi khung. Vì vậy ở mức cao, logo có thể đã đạt kích thước tối đa của template.
- **Bo góc logo**: 0% giữ tỷ lệ gốc; mức lớn hơn 0 dùng khung vuông cắt giữa ảnh và bo góc dần; 100% là hình tròn thật (chiều rộng bằng chiều cao).
- Logo + tên, chỉ logo và chỉ tên vẫn hoạt động. Các lựa chọn áp dụng chung trong preview và MP4, được lưu theo dự án và snapshot render. Dữ liệu cũ mặc định bo góc 0%.
- Với Body bật Toàn video, nhận diện nằm trong thẻ tiêu đề; nếu Chỉ Intro, nhận diện riêng ở góc trên bên phải. Xem tài liệu 15.

## Giao diện từ ảnh

Studio → **Giao diện của bạn → Tải ảnh & tạo giao diện**. Hỗ trợ PNG/JPG/WebP qua pipeline upload có sẵn.

Ứng dụng lấy mẫu pixel trên trình duyệt, bỏ pixel trong suốt, tìm các nhóm màu nổi bật rồi tạo một khung tiêu đề chuyển sắc có chữ chỉnh sửa được. Tên được tự sinh từ màu và tên file, chẳng hạn “Đỏ · tin the thao”; có thể sửa tên, màu chính, màu phụ, màu chữ và bo góc khung.

### Loại bố cục — cập nhật 02/10/2026

Chọn **Loại giao diện khi tải ảnh** trước khi bấm tải:

- **Tiêu đề 1/3 Intro**: nền tràn toàn bộ chiều ngang, phủ đúng 1/3 dưới video. Logo/tên và tiêu đề nằm ở đầu dải, phụ đề nằm phía trên. Mặc định cho mẫu mới.
- **Popup · thẻ nổi**: thẻ có lề hai bên, cách đáy và có bo góc. Mẫu cũ thiếu thuộc tính loại vẫn giữ popup.

Sau khi tạo, đổi bằng **Loại giao diện** mà không cần tải ảnh lại; lựa chọn lưu riêng theo từng mẫu. Cả hai loại tuân theo Chỉ Intro / Toàn video. Bộ chọn loại độc lập với cách dùng ảnh bên dưới; cả hai hỗ trợ lấy bảng màu hoặc dùng ảnh nguyên. “Popup” là kiểu thẻ nổi trong video, chưa có hiệu ứng bật/tắt theo thời điểm riêng.

Hai chế độ dùng ảnh:

1. **Lấy bảng màu · chữ chỉnh sửa được**: dùng bảng màu tạo thành giao diện mới, không dùng chữ/logo đã in trong ảnh. Tiêu đề lấy từ kịch bản/dự án.
2. **Dùng nguyên ảnh trong khung tiêu đề**: dùng ảnh làm nền khung, crop phủ đầy và phủ lớp tối để chữ dễ đọc. Chữ hoặc logo in sẵn trong ảnh vẫn còn; chọn ảnh nền sạch/ảnh không chữ nếu không muốn chồng chữ. Chế độ này dùng chữ trắng.

Mỗi dự án lưu tối đa 20 mẫu riêng. Chuyển mẫu bằng **Giao diện custom**; mẫu và ảnh nguồn vẫn còn khi chuyển sang mẫu dựng sẵn. Chế độ Chỉ Intro/Toàn video tiếp tục áp dụng. Thư viện hiện theo từng dự án, chưa có thư viện dùng chung giữa các dự án.

**Giới hạn rõ ràng:** đây là phân tích bảng màu và tạo khung theo bố cục có sẵn, không phải AI/OCR dựng lại toàn bộ ảnh mẫu. Chưa tự nhận diện và tách mọi chữ, logo, họa tiết, tọa độ thành layer. Không có yêu cầu API AI, không gửi ảnh sang dịch vụ bên ngoài. Nếu cần sao chép bố cục ảnh bất kỳ thành các layer chính xác thì cần triển khai thêm bước nhận diện và trình chỉnh sửa layer.

## Kiểm tra

- Schema chấp nhận scale 10, bo góc 0–100; giữ mặc định cũ và từ chối ngoài giới hạn.
- Kiểm tra hình tròn, giới hạn kích thước, phân tích màu và tên tự động, lưu cấu hình custom và phát hiện ảnh nguồn thiếu.
- E2E upload ảnh thật → tạo tên → đổi tên → đổi chế độ → gắn ảnh làm logo → 1000%/bo tròn → lưu/mở lại; kiểm tra Intro/Body. Logo 1000% tròn được kiểm tra trên 7 phong cách ở cả đầu ra dọc và ngang.
- [MP4 mẫu 1080p](previews/custom-logo.mp4), [ảnh mẫu](previews/custom-logo.jpg), [thông số](previews/custom-logo-manifest.json). Chạy lại: `node --import tsx scripts/preview-custom.ts`.


Kiểm tra bổ sung 02/10: TypeScript và 15 kiểm thử schema/bố cục đạt. Trên trình duyệt đã tải ảnh tạo loại 1/3, đo chiều rộng bằng 100% video, chiều cao 33,332% (sai số hiển thị), đổi popup thấy lề/bo góc và xác nhận loại popup còn nguyên sau lưu/mở lại. Kiểm thử E2E tự động đã bổ sung, chưa chạy lại toàn bộ; chưa render MP4 bổ sung.


### Điều chỉnh chiều cao và vị trí — 02/10/2026

Studio → **Kích thước & vị trí khung**:

- **Chiều cao khung 50–200%**: so với chiều cao gốc của phong cách. Với loại 1/3, 150% tương đương nửa chiều cao video; khung mở rộng lên trên khi giữ vị trí mặc định. Popup và các phong cách có sẵn thay chiều cao phần khung, không kéo giãn logo/chữ.
- **Vị trí lên / xuống −30% đến +30%**: tính theo chiều cao video. Giá trị dương đẩy cả khung lên, âm hạ xuống. Loại 1/3 mặc định chạm đáy nên không thể hạ thêm ở vị trí này; đẩy lên tạo khoảng trống dưới dải.
- Chừa chiều cao tối thiểu cho logo/tên và chữ; giới hạn tổng chiều cao 70% video và mép trên ở ít nhất 15% để còn chỗ cho phụ đề. Vì vậy ở các tổ hợp cực đại, kích thước/vị trí thực tế có thể đạt giới hạn trước thanh chỉnh.
- Phụ đề đi theo mép trên; Sign/watermark và các lớp UI nền tảng không đổi vị trí. Chữ tiêu đề được đo lại khi đổi khung.
- **Đặt lại kích thước & vị trí** đưa riêng phong cách đang chọn về 100% và 0%. Thiết lập lưu riêng theo từng phong cách, từng mẫu custom và từng loại 1/3/popup, không mất khi đổi mẫu. Dữ liệu cũ giữ bố cục mặc định.
- Dùng chung bố cục cho preview và MP4; tuân theo Chỉ Intro / Toàn video.

Kiểm chứng: TypeScript; 21 kiểm thử model/bố cục; E2E chỉnh khung, lưu/mở lại và khôi phục mặc định; 4 E2E liên quan nhận diện/custom/phong cách/lớp phủ nền tảng đều đạt. Render MP4 thực tế 2 giây với khung Xanh bản đồ cao 150%, đẩy lên 10% và tên 200% thành công. Mốc này bổ sung xác nhận render sau các lần kiểm tra trước bị gián đoạn.
