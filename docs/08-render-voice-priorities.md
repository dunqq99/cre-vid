# 08 — Ưu tiên tốc độ render và giọng đọc

> Cập nhật 03/10/2026: Cre-vid hiện dùng hai giọng TTS local trên CPU, không cần Vbee/Azure. Các mục provider bên dưới là lịch sử phương án cũ. Xem [TTS local](18-local-tts.md) để biết cách cài và kết quả kiểm tra thực tế.


Cập nhật ngày 2026-09-29 từ các mối quan tâm người dùng: render hoạt động thế nào, có nhanh không, nguồn giọng Ngọc Huyền và khả năng dùng giọng AI. Đã có benchmark local cơ bản: video 60 giây/1080p mất 100,3 giây trên M4/16 GB, fixture chưa có video tải lên/TTS. Chưa thử giọng qua tài khoản thật. Xem [số đo và cấu hình máy chủ](11-render-server-requirements.md) cùng [trạng thái triển khai](10-implementation-status.md). Các mục đo mở rộng bên dưới vẫn là kế hoạch.

## Render hoạt động thế nào?

1. Studio lưu danh sách cảnh, thời lượng, crop, chữ, logo, phụ đề và audio thành một phiên bản đã duyệt.
2. Khi nhấn Render, API tạo job và snapshot. Worker phía server nhận công việc; trình duyệt hiển thị trạng thái và người dùng có thể tiếp tục biên tập.
3. Worker tải/cache tư liệu cần dùng, dựng hình theo timeline, mix voice/nhạc rồi mã hóa thành MP4. Một video 60 giây ở 30 fps có 1.800 frame hình.
4. Hệ thống kiểm tra file, đưa vào kho output và cung cấp nút xem/tải. Đăng lên mạng xã hội là bước riêng.

TTS diễn ra trước render để người dùng nghe và chỉnh giọng. Render sử dụng audio đã tạo; không gọi TTS lại nếu nội dung/giọng/cấu hình không đổi. Đây là ghép và dựng từ tư liệu có sẵn; kế hoạch không yêu cầu mô hình AI tạo từng khung video.

Preview chạy trong Studio để kiểm tra bố cục và timing; preview tương tác không bảo đảm render MP4 sẽ có cùng tốc độ.

## Đo và tối ưu tốc độ

`Thời gian chờ đầu ra = chờ hàng đợi + chuẩn bị media + render/encode + kiểm tra/lưu file`.

Đo riêng thời gian TTS, upload đầu vào và đăng mạng xã hội. Không gộp các thời gian này vào một con số render gây hiểu nhầm.

- Giữ mục tiêu ban đầu ở tài liệu 06: video mẫu 60 giây, 1080×1920/30 fps, hoàn tất render trong tối đa 5 phút trên cấu hình thử được ghi rõ. Đây là mục tiêu chấp nhận ban đầu, chưa phải số đo hoặc cam kết.
- M0 thử clip 30/60/180 giây: ảnh + chữ, hỗn hợp ảnh/clip, và template nhiều lớp. Mỗi trường hợp chạy ít nhất 3 lần; tách lần cache lạnh và lần cache ấm, ghi median/max và chi phí.
- Kiểm tra một job và nhiều job đồng thời. Không tăng concurrency mù quáng; tốc độ có thể giảm khi CPU/RAM quá tải.
- Dùng proxy nhẹ cho preview, giữ media/font ở gần worker, cache asset và audio; hạn chế hiệu ứng blur/shadow nặng khi không cần thiết.
- Benchmark tăng tốc encode bằng phần cứng nếu máy hỗ trợ. GPU không tự động tăng tốc toàn bộ quá trình dựng cảnh; xác định bước chậm trước khi nâng máy.
- MVP có thể render lại cả timeline khi sửa cảnh. Cache video từng cảnh/intro là tối ưu sau benchmark, không được hứa là đã có; thay đổi timing, transition hoặc âm thanh có thể làm mất hiệu lực cache.

Nguồn kỹ thuật: [Remotion Performance Tips](https://www.remotion.dev/docs/performance) về phần cứng, hiệu ứng và concurrency; [renderMedia](https://www.remotion.dev/docs/renderer/render-media) về tùy chọn hardware encoding. Phương án tối ưu bên trên là đề xuất áp dụng cho Cre-vid, không phải kết quả thử nghiệm.

## Giọng Ngọc Huyền lấy ở đâu?

Vbee có giọng AI Ngọc Huyền. Bài case study của chính Vbee mô tả Beatvn dùng giọng này: [Vbee — Beatvn và Ngọc Huyền](https://vbee.vn/blog/case-study/vbee-aivoice-dung-sau-clip-trieu-view-cua-beatvn/). [Changelog Vbee](https://help.vbee.vn/docs/changelog) ghi các cập nhật Ngọc Huyền/Ngọc Huyền 2.0. Ảnh tham khảo không có audio nên chưa thể xác nhận một video cụ thể dùng đúng giọng/phiên bản/cấu hình nào.

Hai cách đưa vào Cre-vid:

| Cách | Luồng sử dụng | Điều cần kiểm tra |
| --- | --- | --- |
| Vbee API | Chọn giọng trong Cre-vid → gửi đoạn văn → nhận audio → gắn vào cảnh | Quyền API của tài khoản, voice ID/phiên bản Ngọc Huyền, gói cước, giới hạn và quyền dùng đầu ra |
| Import audio | Tạo giọng trên Vbee → tải MP3/WAV → upload vào công đoạn Voice | Đúng lời đọc/đoạn, duration thực, timing phụ đề và quyền dùng đầu ra |

[Trang giá Vbee](https://vbee.vn/en/pricing) có mục kết nối API/doanh nghiệp. Changelog ngày 30/01/2026 ghi hợp nhất gói Studio và API, đồng thời ngừng mở bán gói API riêng. Vì vậy không suy ra API đã ngừng hoạt động, cũng không giả định mọi tài khoản/gói đều có quyền dùng giọng Ngọc Huyền qua API; phải kiểm tra tài khoản thực trước tích hợp.

## Dùng giọng AI có được không?

Có. TTS trong kế hoạch chính là chuyển văn bản thành giọng AI. Không cần tự huấn luyện mô hình để làm MVP. Với ưu tiên mới, M0 cần nghe thử Ngọc Huyền trên Vbee trước, đối chiếu ứng viên Azure trong kế hoạch trước đây; chưa chốt provider chỉ dựa trên tên giọng.

Bộ nghe thử dùng cùng lời dẫn khoảng 30–60 giây, gồm tên riêng, ngày tháng, số, viết tắt và câu dài. Đánh giá rõ chữ, nhịp bản tin, ngắt nghỉ, tính nhất quán, thời gian tạo audio và chi phí thực. Người dùng chọn giọng sau khi nghe.

Bản local đã có khả năng upload MP3/WAV theo đoạn để dùng giọng có sẵn, voice tạo bên ngoài hoặc bản thu thủ công. Audio upload phải qua probe/chuẩn hóa và lưu revision như TTS; nếu không có timing thì cho chỉnh phụ đề theo đoạn. Nếu lời đọc thay đổi, audio upload được đánh dấu cần cập nhật và yêu cầu thay file hoặc chuyển sang TTS, không tự giả định có thể tái tạo bằng provider.
