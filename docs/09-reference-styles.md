# Bốn phong cách từ ảnh tham khảo

Được bổ sung theo bốn ảnh người dùng cung cấp. Đây là template dựng bằng React/CSS/SVG, chữ và logo có thể sửa; không dùng ảnh chụp mẫu làm một tấm overlay cố định.

| Mẫu | Cấu trúc | Thiết lập riêng |
| --- | --- | --- |
| Xanh bản đồ | Nền xanh chuyển sắc, nhãn bo tròn một đầu, chữ Oswald hẹp, họa tiết bản đồ vector | Logo, tên thương hiệu, màu chủ đạo |
| Đỏ hồng | Màu đỏ–hồng phủ dần lên ảnh, tên thương hiệu đậm, chữ trắng, đường nét thành phố | Bật/tắt hàng biểu tượng, tên kênh |
| Khung bản tin | Khung tím–đỏ–cam có tai logo, cạnh vát, bo góc và viền trắng dưới | Logo và màu chủ đạo |
| Thẻ nổi bật | Thẻ trắng kiểu cửa sổ, ba chấm màu, chữ đen/cam, tối đa hai ảnh tròn | Cụm từ nhấn màu, màu nhấn, chọn ảnh tròn theo cảnh |

## Cách dùng

Trong **Studio → Chọn phong cách**, chọn một trong bốn mẫu. Ba mẫu cũ nằm trong **Mẫu đơn giản trước đây**.

- **Chỉ Intro:** toàn bộ lớp thiết kế tiêu đề (khung, gradient, họa tiết, ảnh tròn) chỉ xuất hiện ở Intro; logo/nhãn/watermark thông thường vẫn có thể hiện trên Body/Outro.
- **Toàn video:** giữ tiêu đề chung và phong cách trên mọi cảnh. Phụ đề đặt phía trên cả khung và phần tai logo.
- **Gọn phía dưới · theo nền tảng:** co chiều cao theo độ dài tiêu đề, chừa cạnh phải và đáy theo TikTok/Reels. Tiêu đề ngắn dùng thẻ khoảng 9% chiều cao; phụ đề sát phía trên. Không bảo đảm tránh mọi UI khi người xem mở mô tả.
- **Sát ảnh mẫu:** đưa khung về vị trí riêng của từng mẫu. Nên kiểm tra lại lớp che của nền tảng trước khi đăng.

Chọn logo từ tư liệu ảnh đã tải lên. Mẫu thẻ trắng cho chọn tối đa hai ảnh tròn theo cảnh; ảnh được crop chính giữa. Nhập các cụm từ cách nhau bởi dấu phẩy để đổi màu, ví dụ `Messi, Yamal, chung kết`. Các từ còn lại giữ nguyên. Tiêu đề dài được giảm cỡ chữ theo kích thước khung và font đã tải xong; giới hạn tiêu đề bản tin vẫn là 140 ký tự.

## Bản mẫu đã render

Đã tạo các dự án local **Mẫu 1 · Xanh bản đồ**, **Mẫu 2 · Đỏ hồng**, **Mẫu 3 · Khung bản tin**, **Mẫu 4 · Thẻ nổi bật**, mỗi dự án có MP4 mẫu 2 giây, 1080×1920. Mẫu dùng nền minh họa và thương hiệu CRE NEWS; thay bằng tư liệu và logo của dự án khi sử dụng.

- [Xanh bản đồ](previews/emerald.jpg)
- [Đỏ hồng](previews/magenta.jpg)
- [Khung bản tin](previews/bulletin.jpg)
- [Thẻ nổi bật](previews/spotlight.jpg)
- [ID dự án/job mẫu](previews/manifest.json)

Bản đồ, đường nét thành phố và biểu tượng được dựng lại; không phải bộ đồ họa gốc của thương hiệu trong ảnh. Logo gốc/font thương hiệu có thể khác; upload logo riêng để khớp nhận diện. Font Oswald hỗ trợ tiếng Việt được lưu local cùng giấy phép OFL, không tải font từ bên thứ ba lúc render.

## Kiểm tra

32 kiểm thử unit/integration; 6 kiểm thử trình duyệt các phong cách, highlight, hai chế độ title, phụ đề phía trên và lưu cấu hình. Typecheck và production build đạt. Bốn MP4 mẫu xuất bằng cùng composition với Player; đã xem ảnh bìa để kiểm tra chữ, gradient và đường viền.


## Căn theo TikTok / Reels (29/09/2026)

Ở thanh trên bản xem trước, chọn **Căn theo → TikTok / Reels**, bật **Hiện giao diện nền tảng**. Chọn nền tảng cũng chuyển vị trí sang bố cục gọn. Preset được lưu theo dự án và dùng cả khi render; lớp nút, tên kênh và mô tả minh họa chỉ nằm trong Studio, không được đưa vào composition xuất video. Nút phát và thanh tua nằm ngoài khung hình.

Preset video dọc chừa 18% bên phải, 20% phía đáy cho TikTok hoặc 21% cho Reels; đây là lề biên tập để tham chiếu bảng tin với mô tả thu gọn, không phải thông số chính thức áp dụng cho mọi thiết bị hay quảng cáo. Khi mở rộng mô tả hoặc đổi loại bài đăng, giao diện có thể khác. [TikTok cũng phân biệt vùng an toàn theo kích thước, caption và thành phần bổ sung](https://ads.us.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads). Lớp tham chiếu tự ẩn ở khung ngang/vuông. Chế độ sát ảnh mẫu vẫn giữ thiết kế ảnh bìa trước đây.

- [MP4 kiểm tra bố cục gọn, không có giao diện nền tảng](previews/compact-feed.mp4)
- [Ảnh từ MP4](previews/compact-feed.jpg)

Kiểm thử hồi quy đo vị trí thẻ/phụ đề, khoảng cách với thanh nút và mô tả, bật/tắt overlay, phát/tạm dừng và lưu/mở lại nền tảng. Đã kiểm tra tương thích dự án cũ chưa có trường nền tảng.

## Tải logo và nhạc ngay trong Studio

Trong **Nhận diện thương hiệu**, nút **Tải logo** nhận PNG/JPG/WebP; nút **Tải nhạc nền** nhận MP3/WAV/M4A. File được thêm vào thư viện, tự chọn làm logo hoặc nhạc nền và lưu ngay. Có thể đổi sang file khác bằng danh sách sẵn có, hoặc chọn bỏ logo/nhạc. Với logo nên dùng PNG nền trong suốt. Hai mục này dùng giới hạn upload hiện có: 100 MB/file.

Đã kiểm tra upload thực tế qua hai nút, tự gắn đúng loại tài nguyên, giữ nguyên giọng đọc của cảnh và giữ lựa chọn sau khi tải lại trang; kiểm tra TypeScript đạt.

## Hiện logo cùng tên thương hiệu

**Studio → Nhận diện thương hiệu → Hiển thị thương hiệu** có ba lựa chọn: **Logo + tên thương hiệu**, **Chỉ logo**, **Chỉ tên thương hiệu**. Mặc định là hiện cả hai; chưa chọn logo sẽ dùng tên. Logo đứng trước tên; tên dài được giảm cỡ chữ để vừa phần còn lại. Tất cả template và bản xuất dùng chung thành phần BrandMark. Dự án cũ chưa có trường `brand.display` mặc định dùng `both`.

Ban đầu kiểm thử trình duyệt bị duyệt tự động hết thời gian chờ; lượt kiểm tra kích cỡ logo sau đó đã kiểm tra thành công cả ba chế độ nhận diện. Xem trạng thái tổng hợp ở tài liệu 10.

## Kích cỡ logo

Trong **Studio → Nhận diện thương hiệu**, chọn hoặc tải logo rồi kéo **Kích cỡ logo** từ 50% đến 200%. Nút **Đặt lại kích cỡ logo** trả về 100%. Khi chỉ hiện tên, thanh kích cỡ logo được tắt. `brand.logoScale` được lưu vào dự án và snapshot render; dự án cũ dùng 100%.

Chiều cao phần nhận diện của bốn mẫu tự mở rộng khi cần để logo không bị cắt; phụ đề dịch theo mép trên của khung. Cỡ tên thương hiệu vẫn có cơ chế tự co để vừa phần ngang còn lại.

Đã kiểm tra TypeScript, 9 kiểm thử model/template và kiểm thử trình duyệt thực tế: cả logo + tên, chuyển ba chế độ, kích cỡ 200% trong bốn mẫu, đặt lại 100%, lưu/mở lại mức 50%. Kiểm thử trình duyệt cho phần logo + tên trước đó đã chạy thành công trong lượt này.

## Sửa cảnh báo Fast Refresh

Đã thêm `// @refresh reset` tại BrandMark để khởi tạo lại hook khi chỉnh mã trong lúc dev server đang mở. Mảng dependency hiện cố định; cảnh báo người dùng cung cấp so sánh bản cũ 5 phần tử và bản mới 6 phần tử. TypeScript và kiểm thử model/template đạt; chưa xác nhận trực tiếp cảnh báo cũ trên tab sau reload vì truy cập trình duyệt bị timeout ở bước duyệt. Xem [trạng thái chi tiết](10-implementation-status.md).
