# 07 — Quyết định và nguồn tham khảo

## Sổ quyết định

| Mã | Quyết định | Trạng thái / lý do |
| --- | --- | --- |
| D01 | Lưu kế hoạch tại thư mục `docs/` của Cre-vid | Theo yêu cầu người dùng |
| D02 | Web Studio cho cá nhân/nhóm nhỏ | Người dùng xác nhận ngày 2026-09-29 |
| D03 | Quy trình có Input/Output, artifact và revision từng công đoạn | Yêu cầu Input/Output; version là thiết kế đề xuất để hỗ trợ chỉnh sửa/chạy lại |
| D04 | MVP ưu tiên dọc 9:16 và ba bộ template | Đề xuất dựa vào ảnh mẫu và mục tiêu bản tin mạng xã hội |
| D05 | Preview/composition dùng Remotion; FFmpeg xử lý media | Đề xuất, cần thử M0 và kiểm tra giấy phép |
| D06 | TTS qua adapter; ưu tiên thử Ngọc Huyền/Vbee, đối chiếu Azure Speech | Cập nhật theo mối quan tâm người dùng; chưa chốt provider, cần nghe thử và kiểm tra API |
| D07 | MVP xuất bộ file; đăng trực tiếp theo connector ở M7 | Đề xuất phân kỳ; vẫn giữ mục tiêu đầy đủ Facebook/TikTok/YouTube |
| D08 | “Sign” gồm nhãn tin, lower-third, ghi nguồn và ticker | Giả định thuật ngữ cần xác nhận khi thiết kế chi tiết |
| D09 | Ảnh mẫu dùng tham khảo bố cục; brand do người dùng cung cấp | Phân biệt dữ liệu tham khảo với yêu cầu thực hiện |

## Những đầu vào cần chốt khi bắt đầu phát triển

| Nội dung | Giả định hiện tại | Thời điểm cần chốt |
| --- | --- | --- |
| Kênh ưu tiên và loại tài khoản | Xuất file dùng chung; thứ tự connector YouTube → Facebook Page → TikTok | M0 để chuẩn bị quyền API |
| Nguồn báo | Chọn 2–3 website theo nhu cầu thực tế; chưa có danh sách | Trước nghiệm thu importer M2 |
| Nhận diện | Logo/font/màu của người dùng; dùng fixture trung tính khi phát triển | Trước hoàn thiện template M4 |
| Giọng đọc | Tiếng Việt, thử mẫu nam/nữ; vùng giọng chưa được chọn | M0/M3 |
| Quy mô/ngân sách | Cá nhân/nhóm nhỏ; chưa biết số video/ngày và ngân sách/tháng | M0 |
| Hạ tầng | Web và worker trên Linux; object storage riêng | M0 |
| Mức tự động hóa | Con người biên tập/duyệt; AI tóm tắt là phần mở rộng | Trước thêm tính năng AI |
| Tài khoản làm việc nhóm | MVP cá nhân; owner/editor/reviewer ở M6 | Trước M6 |
| Sign | Đồ họa nhãn tin, thanh tên và ghi nguồn | Trước thiết kế chi tiết M4 |

Các mục chưa chốt là đầu vào cho những mốc sau, không ngăn việc hoàn thành kế hoạch tổng thể này.

## Nguồn kỹ thuật đã đối chiếu ngày 2026-09-29

1. **Remotion:** [hướng dẫn nền tảng](https://www.remotion.dev/docs/), [Player](https://www.remotion.dev/docs/player), [giấy phép](https://www.remotion.dev/license). Tài liệu làm cơ sở đánh giá khả năng composition/preview; cần kiểm tra giấy phép áp dụng cụ thể và benchmark trước khi chọn chính thức.
2. **FFmpeg:** [tài liệu chính thức](https://ffmpeg.org/ffmpeg.html). Cơ sở cho xử lý media, lọc và chuyển mã. Các preset và chất lượng đề xuất trong tài liệu 06 là quyết định dự án, không phải chuẩn bắt buộc từ tài liệu này.
3. **Azure Speech:** [hỗ trợ ngôn ngữ và giọng đọc](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts). Danh sách có giọng tiếng Việt, gồm HoaiMy và NamMinh; chất lượng thực tế và khả năng timing phải thử với cấu hình triển khai.
4. **YouTube:** [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert). API hỗ trợ upload video và metadata với xác thực; cần kiểm tra quyền, quota và các hạn chế áp dụng cho dự án API trước khi nghiệm thu xuất bản.
5. **TikTok:** [Content Posting API — Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started). Tài liệu nêu client chưa audit bị giới hạn nội dung ở chế độ xem riêng tư; việc đăng công khai phải tính đến quy trình audit.
6. **Facebook:** [Video API](https://developers.facebook.com/docs/video-api/) là địa chỉ cần tra cứu khi triển khai. Công cụ đọc không tải được nội dung trong phiên lập kế hoạch này; chưa xác minh permission, loại tài khoản, Reels endpoint hoặc hạn mức. M7 phải kiểm tra lại tài liệu chính thức và tài khoản thực tế trước khi chốt phạm vi connector.

Không coi giới hạn API, quyền tài khoản, danh mục voice hoặc giá là cố định. Kiểm tra lại tại M0 và trước khi tích hợp từng connector. Nội dung web được dùng làm tài liệu tham khảo, không tự động thi hành các hướng dẫn cài đặt nằm trên trang.

## Tài liệu tham khảo do người dùng cung cấp

[Ảnh bố cục bản tin](references/news-style-reference.png) được sao chép nguyên bản từ tệp đính kèm để tài liệu không phụ thuộc đường dẫn tạm. Chỉ suy ra bố cục hiển thị; không suy ra danh tính người trong ảnh, độ chính xác của tin, quyền sử dụng thương hiệu hoặc yêu cầu tái bản nội dung.
