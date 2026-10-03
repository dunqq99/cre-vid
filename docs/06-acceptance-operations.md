# 06 — Nghiệm thu và vận hành

## Ma trận nghiệm thu

Các tiêu chí dưới đây là yêu cầu kiểm tra khi triển khai, chưa phải kết quả đã chạy.

| Mã | Kịch bản | Kết quả bắt buộc | Liên quan |
| --- | --- | --- | --- |
| A01 | Tạo dự án, upload 4 ảnh và 2 clip, lưu/đóng/mở lại | Tư liệu, thứ tự cảnh và chỉnh sửa được khôi phục | R02, M1 |
| A02 | Một file hỏng, một clip xoay dọc, một clip không có tiếng | Lỗi chỉ ở file hỏng; giữ đúng hướng; clip không tiếng vẫn dùng được | R02, M1 |
| A03 | Nhập kịch bản tay và lấy bài từ nguồn đã hỗ trợ | Cùng tạo đoạn có cấu trúc; URL/nguồn được giữ; trường không biết không bịa | R03, M2 |
| A04 | URL bị chặn, HTML đổi hoặc chứa chỉ dẫn điều khiển | Có thông báo/fallback dán văn bản; nội dung chỉ là dữ liệu | R03, M2 |
| A05 | Tạo voice rồi sửa một đoạn | Chỉ đoạn đổi cần TTS mới; revision/timing được cập nhật; đoạn cũ vẫn truy xuất được | R04–R05, M3 |
| A06 | Dựng bản tin 60–90 giây theo cả 3 template | Có intro logo/tiêu đề/voice tóm tắt, body, watermark, sign, phụ đề | R06–R07, M4 |
| A07 | Headline dài, font tiếng Việt, audio dài hơn cảnh | Không cắt dấu/chữ hoặc lời đọc; lỗi bố cục chặn render và chỉ vị trí sửa | R04, R06–R07, M4 |
| A08 | Render trong khi tiếp tục chỉnh dự án | File đúng snapshot đã duyệt; bản mới phải được duyệt/render riêng | R05, R08, M5 |
| A09 | Ngắt worker giữa job, thử lại và hủy job | Trạng thái rõ, không mất file gốc, không công bố file dở, không job trùng có hiệu lực | R05, R08, M5 |
| A10 | Tải bộ xuất bản MVP | Có MP4, thumbnail, SRT, tiêu đề/mô tả/hashtag; xem/nghe được trên thiết bị thử | R08, M5 |
| A11 | Chuyển 9:16 sang 16:9 và 1:1 | Bố cục và crop được duyệt riêng, chữ không tràn khung | R08, M6 |
| A12 | Đăng lên ba nền tảng; một đích lỗi hoặc token hết hạn | Trạng thái từng đích độc lập, đối soát retry, có URL nếu đăng thành công | R08, M7 |
| A13 | Người không có quyền mở asset/job của dự án khác | Server từ chối; không lộ file qua API hoặc URL ký mới | M1, M6 |

## Preset xuất đề xuất

| Preset nội bộ | Hình ảnh | Âm thanh | Mốc |
| --- | --- | --- | --- |
| Social Vertical | 1080×1920, 9:16, 30 fps, MP4/H.264, yuv420p | AAC, 48 kHz, stereo | MVP |
| Landscape | 1920×1080, 16:9, 30 fps, MP4/H.264, yuv420p | AAC, 48 kHz, stereo | M6 |
| Square | 1080×1080, 1:1, 30 fps, MP4/H.264, yuv420p | AAC, 48 kHz, stereo | M6 |

Đây là preset sản phẩm, không phải tuyên bố mọi nền tảng luôn chấp nhận cùng cấu hình. Connector phải kiểm tra dung lượng, thời lượng, codec, loại bài đăng và quyền tài khoản theo tài liệu hiện hành trước khi gửi. Shorts/Reels/video thường là lựa chọn đích xuất bản riêng, không chỉ tên preset.

## Chất lượng hình và âm thanh

- Mở video đầu ra bằng ít nhất hai trình phát và một điện thoại; xem đầu/cuối và tất cả điểm chuyển cảnh.
- Kiểm tra tự động bằng ffprobe: container/codec, kích thước, fps, audio stream, duration và khả năng decode. Sai lệch duration so với timeline mục tiêu tối đa 1 frame cho video.
- Kiểm tra đồng bộ lời đọc/phụ đề bằng 10 mốc nghe thực tế; mục tiêu sai lệch không quá 200 ms sau khi biên tập. Nếu timing chỉ theo đoạn, không nghiệm thu như phụ đề từng từ.
- Không có màn đen do thiếu media, font mất dấu, chữ tràn, watermark bị cắt hoặc phụ đề che headline.
- Mục tiêu mix nội bộ: khoảng -16 LUFS integrated và true peak không vượt -1 dBTP, kiểm tra sau encode; đây là lựa chọn sản xuất của dự án, không phải thông số bắt buộc của mạng xã hội.
- Khi đã có voice thì nhạc nền không che lời; đoạn không tiếng gốc vẫn render ổn định. Cảnh giữ frame/lặp clip phải được người biên tập thấy và chấp nhận.

## Hiệu năng và độ ổn định

Các mục tiêu đề xuất cần kiểm chứng và điều chỉnh ở M0:

- Đo trên cùng fixture 60 giây, 4 ảnh + 2 clip, 1 track voice, 1 track nhạc và các lớp chữ MVP.
- Ghi rõ CPU/RAM, phiên bản engine, thời gian tải asset, render và encode. Mục tiêu ban đầu render không quá 5 phút trên cấu hình worker đã chọn; chưa cam kết trước benchmark.
- Giao diện vẫn chỉnh sửa được khi có job render; API tạo job mục tiêu p95 dưới 2 giây, không tính upload file.
- Khởi đầu một job render/worker, hàng đợi cho việc còn lại. Đo tải trước khi tăng số job đồng thời.
- Autosave debounce mục tiêu 2 giây; báo rõ đang lưu/đã lưu/lỗi. Bài kiểm tra đóng/mở dùng revision đã được server xác nhận.

## Vận hành và phục hồi

| Hạng mục | Quy định đề xuất |
| --- | --- |
| Theo dõi job | Log theo projectId/jobId; thời gian chờ/chạy, lần retry, lỗi provider, bộ nhớ và dung lượng tạm |
| Cảnh báo | Queue bị kẹt, worker không heartbeat, hết dung lượng, TTS/render lỗi lặp lại, token xuất bản cần kết nối lại |
| Sao lưu | DB hàng ngày; object storage có versioning/lifecycle; thử khôi phục một dự án đầy đủ trước khi vận hành thật |
| Lưu trữ | File gốc và render đã duyệt giữ đến khi người dùng xóa; file tạm sau job được dọn trong 24 giờ; proxy có thể tái tạo |
| Xóa | Có thùng rác dự kiến 7 ngày; cleanup không xóa asset đang được snapshot/job sử dụng; công bố rõ thời gian lưu backup |
| Bí mật | Khóa TTS và token xã hội mã hóa phía server; hỗ trợ thu hồi/đổi khóa; log không ghi secret |
| Phiên bản | Pin dependency và image worker; lưu engine/font/template version để đối soát render cũ |

## Chi phí cần đo

Chưa có ngân sách hoặc cấu hình máy được xác nhận, vì vậy không đưa ra đơn giá giả định.

`Chi phí / video = TTS theo mức sử dụng + tài nguyên render + lưu trữ theo thời gian + băng thông tải/xuất + phần hạ tầng cố định phân bổ`.

Dashboard vận hành nên ghi số ký tự TTS gửi thực tế, cache hit, render seconds, số lần thử lại, GB lưu trữ và GB truyền ra. Mỗi lần tạo lại voice chỉ gửi đoạn đổi; render chính sau khi duyệt preview; hạn mức dự án giúp tránh job vượt ngân sách. Giá nhà cung cấp lấy tại thời điểm chốt triển khai.

## Điều kiện phát hành

MVP hoàn tất khi A01–A10 và A13 đạt, đã phục hồi thử một dự án từ backup, không còn lỗi chặn luồng tạo video và có hướng dẫn sử dụng ngắn. M6 bổ sung A11 và phân quyền nhóm. M7 chỉ hoàn tất từng connector sau A12 trên nền tảng tương ứng; xuất được file không đồng nghĩa API đăng trực tiếp đã hoạt động.
