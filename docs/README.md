# Cre-vid — Kho kế hoạch dự án

Ngày khởi tạo: 2026-09-29. Trạng thái: đã có bản Studio local v0.1 chạy thử; lộ trình sản phẩm đầy đủ vẫn đang triển khai.

## Mục tiêu

Xây dựng Studio sản xuất video thời sự/báo chí từ hình ảnh hoặc video, kịch bản nhập tay hoặc nội dung lấy từ website báo. Người dùng đi qua từng công đoạn có Input/Output rõ ràng: tư liệu → kịch bản → giọng đọc → dựng video theo template → kiểm duyệt → render → xuất bản Facebook, TikTok, YouTube.

`/docs` trong yêu cầu được hiểu là thư mục `docs/` tại gốc dự án Cre-vid. Đây là nơi lưu yêu cầu, thiết kế, kế hoạch, quyết định và tiến độ; dữ liệu media vận hành sẽ nằm trong kho lưu trữ riêng.

## Danh mục tài liệu

| Tài liệu | Nội dung |
| --- | --- |
| [01 — Sản phẩm và phạm vi](01-product-scope.md) | Yêu cầu, giả định, MVP và các giai đoạn mở rộng |
| [02 — Luồng Input/Output](02-workflow-input-output.md) | Đầu vào/đầu ra từng bước, phiên bản, chạy lại và xử lý lỗi |
| [03 — Studio và template](03-studio-templates.md) | Màn hình, timeline, intro, nội dung, watermark, sign, phụ đề |
| [04 — Kiến trúc và dữ liệu](04-architecture-data.md) | Phương án kỹ thuật, mô hình dữ liệu, API, xử lý nền |
| [05 — Lộ trình xây dựng](05-delivery-plan.md) | Các mốc, backlog, phụ thuộc, đầu ra và cách kiểm tra |
| [06 — Nghiệm thu và vận hành](06-acceptance-operations.md) | Kịch bản nghiệm thu, chất lượng, chi phí và vận hành |
| [07 — Quyết định và nguồn tham khảo](07-decisions-sources.md) | Quyết định đề xuất, điều cần chốt và nguồn kỹ thuật |
| [08 — Tốc độ render và giọng đọc](08-render-voice-priorities.md) | Cách render, benchmark, giọng Ngọc Huyền/Vbee và sử dụng giọng AI |
| [09 — Bốn phong cách tham khảo](09-reference-styles.md) | Template theo ảnh, tùy chỉnh và bản render mẫu |
| [10 — Tiến độ và lỗi đã sửa](10-implementation-status.md) | Chức năng hoàn thiện, bằng chứng kiểm tra và phần chưa nghiệm thu |
| [11 — Máy chủ render](11-render-server-requirements.md) | CPU/RAM/SSD, GPU, benchmark và cấu hình đề xuất |
| [12 — Thể thao, Phim ảnh, Shorts](12-themed-styles.md) | Ba phong cách mới, hướng dẫn chọn và video mẫu |
| [13 — Nền tảng và Body](13-platform-preview-body.md) | TikTok/Reels/Shorts theo ảnh mẫu, bỏ Outro, nhận diện đối diện, Sign mờ và Body 4:3/1:1 |
| [14 — Logo và custom](14-custom-styles-logo.md) | Logo 1000%, bo tròn, tạo mẫu riêng từ bảng màu/ảnh và tự đặt tên |
| [15 — Sửa lớp phủ và nhận diện](15-overlay-corrections.md) | Thương hiệu trong thẻ Body; nền tảng chỉ là preview; Intro có nền tiêu đề đặc |
| [16 — Nhiều tư liệu và hiệu ứng ảnh](16-body-media-motion.md) | Tải ảnh/video thành từng Body, lời đọc riêng, zoom/lướt ảnh và căn tỷ lệ/vị trí nguồn |
| [17 — Facebook Page và X](17-social-publishing.md) | Kết nối OAuth, duyệt và đăng video, hàng đợi, cấu hình ứng dụng API và giới hạn |
| [Ảnh tham khảo](references/news-style-reference.png) | Hình do người dùng cung cấp, chỉ dùng làm tham khảo bố cục |

## Cách quản lý kế hoạch

- Xem tài liệu 10 để biết trạng thái hiện tại và tài liệu 11 để chọn cấu hình render. Tài liệu 01–08 giữ yêu cầu/kế hoạch gốc; tài liệu 05 theo dõi lộ trình đầy đủ.
- Trạng thái công việc: `planned`, `in_progress`, `blocked`, `done`. Chỉ đánh dấu `done` khi có bằng chứng nghiệm thu.
- Thay đổi phạm vi hoặc công nghệ phải cập nhật tài liệu liên quan và ghi vào nhật ký bên dưới.
- Quyết định đã xác nhận ghi rõ ngày và người xác nhận. Kiến trúc bản local được ghi tại docs/plans/2026-09-29-local-studio.md; hạ tầng production vẫn là đề xuất.
- Khi bắt đầu mỗi phân hệ, bổ sung kế hoạch kỹ thuật chi tiết vào `docs/plans/`; ghi quyết định dài hạn vào `docs/decisions/`. Chỉ tạo các thư mục này khi có tài liệu thực tế.
- Không đưa khóa API, token đăng nhập, video dung lượng lớn hoặc dữ liệu người dùng vào kho kế hoạch.

## Nhật ký

| Ngày | Phiên bản | Thay đổi |
| --- | --- | --- |
| 2026-09-29 | 0.1 | Khởi tạo kế hoạch tổng thể từ yêu cầu và ảnh tham khảo; xác nhận web cho cá nhân/nhóm nhỏ; công nghệ, nguồn báo, giọng đọc và quy mô vận hành còn là đề xuất |
| 2026-09-29 | 0.2 | Bổ sung ưu tiên benchmark render, kiểm tra giọng Ngọc Huyền/Vbee và đề xuất import MP3/WAV theo đoạn |
| 2026-09-29 | 0.3 | Có Studio local, worker render, adapter TTS và benchmark 60 giây/1080p; xem [hướng dẫn chạy](../README.md) và [nhật ký](plans/2026-09-29-local-studio.md) |
| 2026-09-29 | 0.4 | Tổng hợp bốn mẫu, bố cục TikTok/Reels, upload logo/nhạc, logo + tên, kích cỡ logo và xử lý Fast Refresh; bổ sung cấu hình máy chủ cùng giới hạn benchmark |
| 2026-09-29 | 0.5 | Thêm Thể thao, Phim ảnh, YouTube Shorts; 34 kiểm thử, 8 E2E, build và 3 MP4 mẫu đạt |

| 2026-09-30 | 0.6 | Khung điện thoại theo ba ảnh mẫu, Body 4:3/1:1 mờ trên/dưới, nhận diện đối diện, độ mờ Sign và bỏ Outro; 38 kiểm thử, 9 E2E, build và MP4 Body đạt |

| 2026-09-30 | 0.7 | Logo 50–1000%, bo góc tới hình tròn, tạo mẫu riêng từ ảnh và tự đặt tên; có mẫu MP4 1080p |

| 2026-10-01 | 0.8 | Đưa nhận diện về thẻ Body khi có tiêu đề, tách UI nền tảng khỏi tọa độ render, nền tiêu đề Intro không xuyên ảnh |

| 2026-10-02 | 0.9 | Tạo Body hàng loạt từ ảnh/video, lời đọc từng cảnh, zoom/lướt ảnh, tỷ lệ gốc và vị trí tư liệu; 53 kiểm thử và 15 E2E đạt, MP4 chuyển động đã kiểm chứng |
| 2026-10-02 | 0.10 | Tích hợp Facebook Page Reels và X qua OAuth, duyệt trước khi đăng, hàng đợi và chống trùng; 68 unit/integration, 2 E2E mới, TypeScript/build đạt; còn cấu hình và kiểm chứng tài khoản thật |
