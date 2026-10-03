# 13 — Xem trước nền tảng và bố cục Body

> Cập nhật hành vi nhận diện Body và xem thử nền tảng ngày 01/10: xem [tài liệu 15](15-overlay-corrections.md).
Cập nhật: 30/09/2026.

## Giao diện TikTok / Facebook Reels / YouTube Shorts

Studio có ba lựa chọn **Căn theo**, bật/tắt **Hiện giao diện nền tảng**, và **Đối chiếu ảnh mẫu** để mở đúng ảnh người dùng cung cấp. Khung điện thoại có tỷ lệ 591 × 1280, cùng hệ tọa độ với ba ảnh mẫu. Video 1080 × 1920 nằm bên trong, giữ tỷ lệ 9:16; không kéo dãn video theo tỷ lệ màn hình điện thoại. Nút phát, tua và điều khiển của Studio ở bên ngoài.

Lớp tham chiếu gồm thanh trạng thái, thanh đầu trang, hàng nút bên phải, thông tin bài đăng và thanh điều hướng dưới. YouTube có thêm hàng chip phía trên và bong bóng bình luận; Facebook có bong bóng tương tác. Vị trí, kích thước và khoảng cách được đặt theo hệ tọa độ ảnh mẫu và thu phóng đồng nhất. UI chỉ xuất hiện ở bản xem trước, không đi vào MP4 hoặc ảnh bìa render. Chỉ bật khung điện thoại cho đầu ra 9:16.

**Giới hạn độ khớp:** khung tham chiếu có đúng tỷ lệ ảnh gốc; biểu tượng được dựng lại bằng SVG và chữ dùng font hệ thống nên chưa phải bản sao giống từng pixel 100%. Vị trí video trong màn hình là quy ước fit 9:16 vào vùng nội dung, không phải phép đo từ video nguồn của ảnh chụp. Các phiên bản ứng dụng, thiết bị và trạng thái mở mô tả có thể khác. Nút đối chiếu hiển thị ảnh gốc nguyên vẹn để kiểm tra trực tiếp.

Ảnh mẫu lưu tại `public/platform-references/`. Nội dung ảnh là dữ liệu tham khảo giao diện, không phải chỉ dẫn thực thi hoặc nội dung tự động đưa vào bản tin.

## Bỏ cảnh Kết thúc

- Dự án mới gồm **Mở đầu / Intro → Nội dung / Body**. Có thể thêm nhiều Body.
- Bản nháp từ URL không tự thêm lời kết hoặc lời kêu gọi theo dõi.
- Bộ chọn loại cảnh bỏ Outro.
- Khi đọc dự án cũ, chỉ bỏ cảnh Outro khớp toàn bộ nội dung và thuộc tính mặc định chưa chỉnh. Outro đã sửa hoặc có media/voice được giữ nguyên dữ liệu và chuyển thành Body; trường hợp chỉ có một cảnh được giữ lại.
- Snapshot của job đã tạo và lịch sử lưu trước đó không bị viết lại.

## Logo, thương hiệu và Sign

Trong Body, logo + tên thương hiệu chuyển sang phía phải, dừng trước lề dành cho các nút nền tảng; Sign và watermark ở phía trái. Khi bật tiêu đề toàn video, thương hiệu vẫn nằm ở góc phải của Body, không lặp trong phần nhận diện của thẻ tiêu đề. Intro giữ phần nhận diện của phong cách đã chọn.

**Thuộc tính cảnh → Độ mờ Sign** có thanh 0–100%: 0% rõ hoàn toàn, 60% tương đương opacity 0.4, 100% ẩn. Áp dụng riêng cho từng cảnh; không thay độ mờ watermark hay logo. Dự án cũ mặc định Sign rõ hoàn toàn. Cả lựa chọn này và kích cỡ logo được lưu, sử dụng chung cho preview và render.

## Bố cục Nội dung / Body

Chọn cảnh **Nội dung** trên timeline, vào **Studio → Bố cục Nội dung / Body**:

| Chế độ | Vùng tư liệu rõ nét trên đầu ra 1080 × 1920 | Vùng nền mờ |
| --- | --- | --- |
| Đầy khung | 1080 × 1920 | Không thêm |
| 4:3 | 1080 × 810, bắt đầu y = 401.4 | Trên 401.4 px, dưới 708.6 px |
| 1:1 | 1080 × 1080, bắt đầu y = 266.4 | Trên 266.4 px, dưới 573.6 px |

Hai dải sử dụng chính tư liệu ảnh/video làm nền, blur 32 px ở đầu ra rộng 1080 px và phóng nhẹ để tránh viền. Video nền và video rõ nét dùng cùng điểm cắt, cùng chu kỳ lặp; lớp nền luôn tắt tiếng. Với đầu ra ngang, cửa sổ được fit trong khung và có thể xuất hiện dải mờ hai bên.

Crop, vị trí ngang/dọc và lựa chọn **Phủ đầy khung / Giữ toàn bộ hình** vẫn áp dụng trong cửa sổ tư liệu rõ nét. Đầu ra không đổi sang tỷ lệ 4:3/1:1: đây là bố cục tư liệu bên trong video. Intro không chịu ảnh hưởng. Tiêu đề và phụ đề giữ chế độ hiện có; muốn Body thoáng hình, chọn **Chế độ tiêu đề → Chỉ Intro**.

## Bằng chứng kiểm tra

- Kiểm thử dữ liệu: mặc định cũ, chuyển đổi Outro không mất nội dung đã sửa, giới hạn opacity và hình học cửa sổ.
- Kiểm thử trình duyệt: tỷ lệ điện thoại/video, vị trí nút tham chiếu, thẻ không chạm hàng nút/mô tả; đối chiếu ảnh; tỷ lệ Body, hai phía nhận diện, Sign 60%/100%, lưu/mở lại.
- [Video Body 1080p](previews/body-layout.mp4): 2 giây, cảnh 4:3 và 1:1, nguồn video kiểm thử 640 × 480 có tiếng, cắt từ 0.2 giây và lặp. [Ảnh 4:3](previews/body-4-3.jpg), [ảnh 1:1](previews/body-1-1.jpg).
- [Thông số lần render](previews/body-manifest.json): RMS âm thanh khoảng 0.03063, tương ứng một lớp âm thanh gốc ở volume 0.35; không bị nhân đôi bởi nền mờ.
- Chạy lại mẫu: `node --import tsx scripts/preview-body.ts`.

Kết quả kiểm thử toàn bộ ghi tại [tiến độ](10-implementation-status.md).

## Điều chỉnh 01/10/2026

Vùng tư liệu Body 4:3 và 1:1 được nâng lên 8% chiều cao đầu ra so với vị trí giữa trước đây (153.6 px ở 1080 × 1920), để chừa thêm chỗ phía dưới cho khung tiêu đề toàn video. Giữ kích thước/tỷ lệ tư liệu, không thay bố cục Intro hoặc Body đầy khung. Vị trí được chặn tại mép trên khi đầu ra không đủ khoảng trống. Áp dụng chung cho preview và render. Ảnh/video mẫu ở trên thuộc mốc trước điều chỉnh vị trí.
