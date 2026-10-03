# 15 — Nhận diện trong thẻ và lớp phủ nền tảng

Cập nhật: 01/10/2026. Tài liệu này thay thế hành vi nhận diện Body và căn theo nền tảng mô tả tại tài liệu 13–14.

## Nhận diện Body

Khi bật **Toàn video**, các mẫu có phần nhận diện trong thẻ (7 mẫu thiết kế và custom) hiển thị logo + tên thương hiệu ngay trong thẻ, giống Intro. Không lặp nhận diện ở góc trên. Khi chọn **Chỉ Intro**, Body không có thẻ và vẫn hiển thị nhận diện riêng ở góc trên bên phải, đối diện Sign/Watermark. Ba mẫu đơn giản cũ vốn không có phần nhận diện trong thẻ tiếp tục dùng nhận diện riêng.

Chiều cao vùng nhận diện trong thẻ Body chừa đủ chỗ cho logo và tên thương hiệu như Intro; bo tròn và giới hạn kích thước tiếp tục hoạt động.

## Nền tảng chỉ là lớp phủ xem thử

Bộ chọn đổi nhãn thành **Xem trên**. TikTok, Facebook Reels và YouTube Shorts chỉ thay lớp UI mô phỏng. Khung video, tư liệu, Sign, watermark, logo, tên thương hiệu, tiêu đề và phụ đề giữ nguyên tọa độ. Có thể nhìn thấy nội dung bị UI nền tảng che để quyết định tự điều chỉnh bố cục.

- Tất cả dùng cùng một viewport video 9:16 trong khung điện thoại 591 × 1280.
- Chuyển nền tảng không ép vị trí về “safe”, không làm dự án cần lưu và không thay revision.
- Lựa chọn lưu cục bộ ở trình duyệt; dữ liệu `design.platform` cũ chỉ còn dùng làm gợi ý ban đầu, không quyết định tọa độ render.
- Tọa độ bố cục video mặc định dùng lề cố định: ngang trái 8%, phải 18%, tiêu đề gọn cách đáy 20%, nhãn bắt đầu ở 9% chiều cao. Vị trí “Sát ảnh mẫu” vẫn là lựa chọn riêng.
- UI nền tảng không xuất vào MP4. Việc bật/tắt khung điện thoại có thể đổi kích thước trình bày preview, nhưng không đổi tọa độ bên trong video.

## Tiêu đề Intro rõ trên ảnh

Cả Xanh bản đồ và Đỏ hồng, theo yêu cầu chỉnh sửa tiếp theo ngày 01/10, đều có mép chuyển sắc hạ vào vùng nhận diện: bắt đầu không cao hơn mép trên ô, đạt nền đặc ở 75% chiều cao ô logo. Dải chuyển sắc thu hẹp còn tối đa 3% chiều cao video. Ô logo của Xanh bản đồ có nền đặc riêng; vùng chữ tiêu đề bên dưới vẫn hoàn toàn đặc. Ảnh/video không xuyên qua vùng chữ. Bản đồ/họa tiết trang trí của template vẫn giữ nguyên.

Bỏ hiệu ứng mờ dần của cả khung ở 10 frame đầu: khung, logo và chữ hiện rõ ngay tại frame 0, kể cả khi tạm dừng để chèn ảnh trong Input. Điều chỉnh dùng chung cho preview và render.

## Kiểm chứng

- 12 kiểm thử trình duyệt đạt, bao gồm đo toàn bộ vị trí video/Sign/watermark/brand/title/sub khi chuyển cả ba nền tảng, ở cả bố cục gọn và sát ảnh mẫu; xác nhận cấu hình/revision không đổi.
- So sánh ảnh chụp vùng tiêu đề Intro trước và sau khi thêm ảnh nền: dữ liệu PNG giống nhau, xác nhận không có ảnh nền xuyên qua.
- Kiểm tra nhận diện Body trong thẻ qua 7 phong cách; kiểm tra custom và các chế độ logo trong bộ E2E.
- Kết quả unit/render/build ghi tại tài liệu tiến độ.

## Dải tên thương hiệu gọn — 01/10/2026

Theo yêu cầu mới nhất, mẫu Xanh bản đồ giữ **dạng nửa viên thuốc**: đầu trái thẳng kéo sát mép video, đầu phải bo tròn và kết thúc ngay sau tên với khoảng đệm nhỏ. Chiều cao dải theo cỡ chữ thực tế, độc lập với kích cỡ logo. Logo nổi trên dải và có thể cao hơn dải khi phóng lớn. Chế độ chỉ logo không vẽ dải tên; chỉ tên vẫn giữ nửa viên thuốc. Dùng chung cho Intro/Body có thẻ và MP4 render.

Studio → Nhận diện thương hiệu → **Kích cỡ tên thương hiệu**: 50–300%, bước 5%, mặc định 100%. Điều chỉnh riêng với logo, áp dụng cho các mẫu và nhận diện góc. Tên dài tự co khi chạm giới hạn chiều rộng; giá trị chọn được lưu vào dự án và snapshot render. Dự án cũ mặc định 100%. Vùng nhận diện và phụ đề chừa thêm chỗ cho chữ lớn; tăng cỡ tên không phóng to logo.

Kiểm tra lần này: 14 kiểm thử model/bố cục và TypeScript đạt; 4 E2E liên quan đạt. Đã đo mép trái dải trùng mép video, hai góc trái thẳng/hai góc phải tròn, chữ 200% làm dải cao gấp đôi, tăng logo không làm dải cao thêm, lưu/mở lại cỡ tên 250%, tên dài và logo trên 7 phong cách.


### Căn đáy và viền dải

Logo và dòng tên thương hiệu mặc định căn cùng cạnh đáy, thay cho căn giữa theo chiều dọc. Ở mẫu Xanh bản đồ, nền nửa viên thuốc có viền trắng đặc 1 px trong hệ tọa độ video; chiều cao tiếp tục theo chữ. Logo lớn nhô lên phía trên dải. Khoảng đệm dải không đẩy dòng tên lên so với đáy logo.

Lần render MP4 kiểm chứng bổ sung chưa chạy do hệ thống duyệt tự động báo workspace hết credits. Các kết quả E2E ở trên thuộc mốc trước chỉnh căn đáy/viền; kiểm thử hình học mới đã bổ sung nhưng chưa chạy lại.


Đã kiểm tra trực tiếp tab local sau chỉnh căn đáy: cạnh đáy logo và dòng tên đều ở tọa độ Y = 507.3399 px trên preview; viền computed style là `1px solid rgb(255, 255, 255)`. TypeScript và 14 kiểm thử model/bố cục tiếp tục đạt. Bộ E2E tự động bổ sung và render MP4 chưa chạy lại.
