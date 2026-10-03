# 12 — Phong cách Thể thao, Phim ảnh và YouTube Shorts

Bổ sung ngày 29/09/2026 theo yêu cầu người dùng. Studio có 7 mẫu thiết kế chính và 3 mẫu đơn giản trước đây.

## Chọn mẫu

Mở **Studio → Chọn phong cách**:

| Phong cách | Thiết kế | Phù hợp |
| --- | --- | --- |
| Thể thao | Nền xanh đen, viền lime, góc vát, vạch chéo, chữ Oswald đậm viết hoa | Tin thi đấu, vận động viên, khoảnh khắc thể thao |
| Phim ảnh | Thẻ tối, đường viền vàng mảnh, chữ sáng căn giữa, họa tiết dải phim | Tin điện ảnh, giới thiệu phim, hậu trường |
| YouTube Shorts | Thẻ trắng bo góc, viền đỏ, bóng đen, chữ lớn, nhãn Shorts | Video ngắn, câu chuyện nhanh, nội dung giải thích |

Chọn mẫu sẽ đặt màu chủ đạo tương ứng; có thể đổi màu sau đó. Nhãn thể loại là đồ họa của template, không thêm tỷ số, thời gian thi đấu hoặc dữ kiện vào nội dung.

Cả ba mẫu dùng bố cục gọn phía dưới; chiều cao co theo độ dài tiêu đề, phụ đề nằm phía trên. Dùng được **Chỉ Intro** hoặc **Toàn video**, cùng ba tỷ lệ 9:16, 16:9, 1:1. Chế độ “Sát ảnh mẫu” dành cho bốn mẫu tham khảo cũ nên không hiển thị ở ba mẫu mới.

Logo + tên / chỉ logo / chỉ tên và kích cỡ logo 50–200% vẫn hoạt động. Phần nhận diện mở rộng theo logo; chữ dài tự giảm cỡ để vừa khung. Tư liệu, watermark, sign và âm thanh dùng luồng hiện có.

**YouTube Shorts ở đây là phong cách đồ họa**, chưa bổ sung lớp UI tham chiếu YouTube hay kết nối đăng YouTube. Bộ chọn nền tảng hiện vẫn là TikTok/Reels; mẫu dùng lề biên tập theo lựa chọn đó khi video dọc.

## Mẫu đã xuất

Ba mẫu dùng nền minh họa, thương hiệu CRE NEWS và phụ đề; MP4 dài 2 giây, 1080×1920. Hình là thumbnail lấy từ video xuất:

| Mẫu | Ảnh | Video |
| --- | --- | --- |
| Thể thao | [JPG](previews/sports.jpg) | [MP4](previews/sports.mp4) |
| Phim ảnh | [JPG](previews/cinema.jpg) | [MP4](previews/cinema.mp4) |
| YouTube Shorts | [JPG](previews/shorts.jpg) | [MP4](previews/shorts.mp4) |

Tạo lại mẫu bằng `node --import tsx scripts/preview-themed.ts`. Script dùng kho tạm, chỉ ghi bộ mẫu vào `docs/previews/`, không sửa dự án người dùng. [Thông tin lần render](previews/themed-manifest.json) không phải benchmark tốc độ cho bản tin dài.

## Kiểm tra

- TypeScript và production build đạt.
- Toàn bộ 34 kiểm thử unit/integration đạt, gồm render MP4 thật.
- Toàn bộ 8 kiểm thử trình duyệt đạt; kiểm tra mới gồm chọn ba mẫu, tiêu đề dài ở ba tỷ lệ, vị trí dưới khung, phụ đề trên title, Intro/Toàn video và lưu/mở lại.
- Kiểm thử nhận diện chạy bổ sung với cả 7 mẫu: logo + tên, cỡ 200% không cắt trong phần nhận diện, reset 100%, lưu/mở lại 50%.
- Đã render và xem ảnh xuất của cả ba mẫu. Kiểm thử trình duyệt mới không ghi nhận console/page error trên luồng được kiểm tra.

Mã chính: `src/video/ThemedOverlay.tsx`, `src/video/FittedTitle.tsx`, catalog trong `src/lib/templates.ts`; preview và export dùng cùng composition.
