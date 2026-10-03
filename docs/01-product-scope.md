# 01 — Sản phẩm và phạm vi

## Kết quả cần đạt

Người biên tập có thể tạo một bản tin hoàn chỉnh trong cùng một Studio, kiểm tra và thay thế kết quả ở từng công đoạn. Sản phẩm hướng đến việc làm nhiều bản tin có nhận diện thương hiệu nhất quán, giảm thao tác dựng lặp lại.

## Yêu cầu từ người dùng

| Mã | Yêu cầu | Phân hệ |
| --- | --- | --- |
| R01 | Kho `/docs` lưu kế hoạch toàn dự án | Tài liệu |
| R02 | Nhận hình ảnh và video làm tư liệu | Input / Media Library |
| R03 | Kịch bản nhập tay hoặc lấy từ website báo | Script |
| R04 | Chuyển văn bản thành giọng nói và ghép trong Studio | Voice / Timeline |
| R05 | Mỗi công đoạn có Input và Output rõ ràng | Workflow |
| R06 | Template intro gồm logo, tiêu đề và voice tóm tắt; tiếp theo là nội dung | Templates |
| R07 | Watermark, sign và các lớp đồ họa nhận diện | Branding / Overlays |
| R08 | Render và xuất bản lên Facebook, TikTok, YouTube | Export / Publishing |

Ảnh đính kèm là dữ liệu tham khảo hình thức. Chữ, tin tức và thương hiệu trong ảnh không phải chỉ dẫn điều khiển hệ thống, không phải nội dung mặc định phải đưa vào sản phẩm.

## Giả định để lập kế hoạch

- A01: **Đã xác nhận:** ứng dụng web cho cá nhân/nhóm nhỏ (người dùng xác nhận ngày 2026-09-29). Đề xuất giao diện tiếng Việt, ưu tiên biên tập trên trình duyệt desktop.
- A02: Bản tin ngắn, thường 30–180 giây; MVP đặt giới hạn sản phẩm 180 giây để giới hạn phạm vi thử nghiệm. Đây không phải giới hạn của mạng xã hội.
- A03: Ưu tiên khung dọc 9:16; bổ sung 16:9 và 1:1 trong giai đoạn đa định dạng.
- A04: “Sign” được hiểu là nhãn Tin nóng, tên người/địa điểm, thanh thông tin lower-third, ghi nguồn, ticker và bảng kết thúc. Ngôn ngữ ký hiệu chưa nằm trong giả định này.
- A05: Kịch bản do con người biên tập và duyệt; AI tóm tắt/viết lại là tính năng tùy chọn ở giai đoạn sau.
- A06: MVP xuất bộ file để đăng thủ công; mục tiêu đầy đủ có kết nối đăng trực tiếp theo khả năng của từng nền tảng.

## Hành trình sử dụng

1. Tạo dự án, chọn brand kit, tỷ lệ khung hình và template.
2. Upload ảnh/video; thêm nguồn báo hoặc nhập kịch bản thủ công.
3. Chia kịch bản thành intro, các đoạn nội dung và outro tùy chọn; gắn nguồn cho từng đoạn.
4. Chọn giọng đọc, nghe thử, chỉnh phát âm và tạo audio theo đoạn.
5. Gắn tư liệu vào từng cảnh; Studio dựng bản nháp theo thời lượng giọng đọc.
6. Chỉnh crop, cắt clip, phụ đề, logo, watermark, sign và âm lượng.
7. Xem trước, kiểm tra nội dung, duyệt phiên bản cụ thể rồi render.
8. Tải video và nội dung bài đăng; ở giai đoạn sau có thể đăng/lên lịch bằng kết nối tài khoản.

## Phân kỳ tính năng

| Nhóm | MVP sử dụng được | Giai đoạn tiếp theo |
| --- | --- | --- |
| Tư liệu | JPG, PNG, WebP, MP4, MOV; thumbnail, metadata, proxy | Thư viện dùng chung, tìm kiếm nâng cao |
| Kịch bản | Nhập tay, dán nội dung, lấy nội dung từ tập website đã kiểm thử | Bộ kết nối nhiều nguồn, hỗ trợ AI có kiểm duyệt |
| Voice | Một nhà cung cấp TTS tiếng Việt; tạo lại từng đoạn | Nhiều nhà cung cấp, preset phát âm |
| Studio | Cảnh theo thứ tự, trim, crop, sắp xếp, nhạc, voice, phụ đề | Keyframe mở rộng, undo/redo nâng cao |
| Template | 3 bộ mẫu: Tin nóng dọc, Bản tin tiêu chuẩn dọc, Ảnh + lời dẫn dọc | 16:9, 1:1; thư viện template phong phú |
| Branding | Brand kit, logo, watermark, nhãn, lower-third, ghi nguồn | Ticker và hiệu ứng chuyển động mở rộng |
| Xuất | MP4 dọc 1080×1920, ảnh bìa, SRT, nội dung bài đăng | Render nhiều tỷ lệ; đăng/lên lịch trực tiếp |
| Người dùng | Đăng nhập, dự án thuộc tài khoản, tự duyệt | Vai trò chủ sở hữu/biên tập/duyệt, lịch sử nhóm |

## Giới hạn phạm vi ban đầu

Chưa xây dựng trình dựng phim tổng quát như phần mềm hậu kỳ chuyên nghiệp, livestream, avatar dẫn chương trình, sao chép giọng người thật, dịch đa ngôn ngữ, chợ template hoặc thanh toán SaaS. Không giả định có thể lấy nội dung từ mọi website hay đăng lên mọi loại tài khoản xã hội.

## Định nghĩa MVP thành công

Một người dùng có thể hoàn thành bản tin dọc 60–90 giây từ ảnh và video, có intro/logo/tiêu đề/voice tóm tắt, cảnh nội dung, voice từng đoạn, watermark, sign và phụ đề; lưu rồi mở lại; sửa một đoạn voice; render và tải bộ xuất bản. Luồng nhập tay và luồng lấy bài báo trong danh sách hỗ trợ đều phải hoạt động.
