# Cre-vid — Kế hoạch triển khai

> **For agentic workers:** Khi thực hiện, dùng `superpowers:executing-plans` để triển khai từng phân hệ theo checklist; chỉ dùng `superpowers:subagent-driven-development` nếu lựa chọn cách thực hiện tương ứng đã được xác nhận. Tài liệu này là kế hoạch tổng thể, không phải yêu cầu tự động bắt đầu viết sản phẩm.

**Goal:** Xây dựng web Studio sản xuất video bản tin từ tư liệu và kịch bản, có TTS, template, render và quy trình xuất bản đa nền tảng.

**Architecture:** Web/API theo module, worker xử lý nền, DB lưu metadata và version, object storage lưu media. Các công đoạn truyền artifact có phiên bản; preview và render dùng chung mô hình cảnh.

**Tech Stack:** Đề xuất Next.js/React/TypeScript, PostgreSQL, Redis/BullMQ, Remotion, FFmpeg, object storage tương thích S3 và TTS adapter; cần xác nhận bằng thử nghiệm M0.

**Spec:** [Sản phẩm](01-product-scope.md), [Input/Output](02-workflow-input-output.md), [Studio](03-studio-templates.md), [Kiến trúc](04-architecture-data.md).

## Ràng buộc chung

- Ứng dụng web cho cá nhân/nhóm nhỏ đã được người dùng xác nhận.
- MVP: video 9:16, 1080×1920, 30 fps, tối đa 180 giây theo giới hạn sản phẩm đề xuất.
- Mỗi công đoạn có Input/Output lưu phiên bản; không ghi đè bản gốc; không tự cắt voice.
- Có nhập tay và nhập nội dung từ tập website được kiểm thử; thất bại có luồng dán văn bản.
- Render dùng snapshot và revision đã duyệt; đăng trực tiếp là mốc riêng sau MVP.
- Dữ liệu tư liệu và website không được coi là chỉ dẫn thực thi.

## Các trường hợp cần chú ý khi review

| Trường hợp dễ lỗi | Hành vi mong đợi | Mốc kiểm chứng |
| --- | --- | --- |
| Clip xoay dọc, VFR, không có tiếng hoặc file hỏng | Giữ hướng/timing; lỗi tách theo asset | M1 |
| Báo đổi HTML, URL redirect hoặc nội dung chứa chỉ dẫn lạ | Báo kết quả trích xuất; giữ như dữ liệu; fallback nhập tay | M2 |
| Tên tiếng Việt, số, viết tắt và voice dài hơn cảnh | Nghe thử/chỉnh đọc, timing theo audio, không mất chữ | M3–M4 |
| Người dùng sửa trong lúc render, worker bị ngắt | File theo đúng snapshot; phục hồi job không ghi đè | M5 |
| Upload xã hội timeout sau khi phía đích đã nhận | Đối soát trạng thái; không đăng trùng | M7 |

## Ước lượng và cách dùng

Ước lượng sơ bộ cho 2 lập trình viên full-time (web/Studio và backend/media), có người thiết kế và QA hỗ trợ bán thời gian. MVP dự kiến 8–12 tuần, gồm khoảng 20% dự phòng; mở rộng đa định dạng/nhóm và kết nối xuất bản thêm 4–8 tuần, không tính thời gian nền tảng xét duyệt. Đây là giả định lập lịch, chưa phải cam kết khi chưa benchmark M0.

Đã triển khai bản local v0.1 theo [kế hoạch kỹ thuật](plans/2026-09-29-local-studio.md). M0–M5 đang `in_progress`: một phần chức năng đã chạy và kiểm thử, nhưng chưa đủ điều kiện nghiệm thu toàn mốc. M6–M7 vẫn `planned`. Trước mỗi mốc, ghi kế hoạch kỹ thuật vào `docs/plans/` với file cụ thể, schema/interface đã chốt, test case và lệnh kiểm tra tương ứng công cụ đã cài; không coi các đường dẫn dự kiến là mã hiện có.

## M0 — Chốt nền tảng và thử nghiệm rủi ro (3–5 ngày)

**Đầu ra:** quyết định stack, mẫu render dọc 60 giây, mẫu giọng đọc, kết quả đo trên máy thử, danh sách website hỗ trợ ban đầu.

**Khu vực dự kiến:** `docs/decisions/`, `experiments/media-pipeline/`.

- [ ] Chọn môi trường deploy, ngân sách và máy benchmark; ghi CPU/RAM/cấu hình render.
- [ ] Render fixture gồm ảnh, clip, font tiếng Việt, headline, watermark và audio bằng stack đề xuất.
- [ ] Thử voice với tên người/địa điểm, ngày tháng, chữ viết tắt; đo độ trễ, chi phí và timing thực.
- [ ] Ưu tiên nghe thử Ngọc Huyền/Vbee và xác minh quyền API; so sánh với ứng viên Azure, chưa chốt provider. Chạy ma trận benchmark render trong [tài liệu 08](08-render-voice-priorities.md).
- [ ] Chốt 2–3 website báo theo nhu cầu, kiểm tra khả năng trích xuất và cách lấy nguồn.
- [ ] Kiểm tra giấy phép/dependency và khả năng đóng gói worker; ghi quyết định chấp nhận hoặc thay stack.

**Nghiệm thu:** mẫu video xem/nghe được; có số đo thời gian/RAM và lựa chọn công nghệ có căn cứ. Nếu chưa đạt, điều chỉnh stack trước khi xây Studio đầy đủ.

## M1 — Dự án và thư viện tư liệu (1–1,5 tuần)

**Phụ thuộc:** M0. **Khu vực:** `apps/web/`, `packages/database/`, `packages/contracts/`, `apps/worker/`.

**Input → Output:** tài khoản + file → Project, Asset, metadata, thumbnail, proxy.

- [ ] Tạo workspace ứng dụng và công cụ kiểm tra cùng chức năng đầu tiên; thiết lập DB, storage, queue, đăng nhập và workspace cá nhân.
- [ ] Viết kiểm tra quyền truy cập asset/job và fixture file hợp lệ/hỏng trước phần xử lý tương ứng.
- [ ] Thực hiện upload, progress, xác minh, probe và proxy; lưu trạng thái từng file.
- [ ] Kiểm tra JPG/PNG/WebP, MP4/MOV, hướng xoay, VFR, file không có audio; đóng tab rồi mở lại dự án.
- [ ] Ghi kết quả kiểm tra và bàn giao mốc với media không bị mất.

## M2 — Nguồn báo và kịch bản (1–1,5 tuần)

**Phụ thuộc:** M1. **Khu vực:** module `sources` và `scripts` trong web/worker, `packages/integrations/`.

**Input → Output:** text/URL → SourceArticle, ScriptRevision, các đoạn intro/body/outro.

- [ ] Khóa schema đoạn kịch bản, source references và revision trong contracts.
- [ ] Kiểm thử nhập tay, bài có/không có tác giả, HTML thay đổi, redirect bị chặn và nội dung có chỉ dẫn không đáng tin cậy.
- [ ] Xây lấy bài nguồn theo danh sách đã chốt, hiển thị nội dung trước khi dùng; thêm fallback dán văn bản.
- [ ] Xây editor chia đoạn, tiêu đề/tóm tắt, lời đọc/chữ hiển thị, lưu revision và conflict khi sửa hai tab.
- [ ] Nghiệm thu hai đường nhập tạo được cùng một cấu trúc kịch bản; số liệu/tên riêng giữ nguyên trừ khi người dùng sửa.

## M3 — Giọng đọc theo đoạn (1 tuần)

**Phụ thuộc:** M2. **Khu vực:** module `voice`, TTS adapter và worker processor.

**Input → Output:** scriptRevision + segmentIds + voice settings → VoiceClip/audio/duration/timing.

- [ ] Chốt adapter request/result và cache key; dùng provider giả lập trong test tự động.
- [ ] Kiểm thử retry timeout, đoạn trống, Unicode và sửa một đoạn không tái tạo các đoạn khác.
- [ ] Xây chọn giọng/tốc độ, nghe thử, chỉnh cách đọc, job theo đoạn, chi phí ước tính theo đơn giá cấu hình.
- [ ] Lưu audio gốc, duration đo từ file; nhận timing từ provider khi có, fallback timing theo đoạn.
- [ ] Bổ sung import MP3/WAV theo đoạn với probe/duration/revision; kiểm tra audio sai định dạng, lời đọc đã thay đổi và tình huống không có timing phụ đề.
- [ ] Nghiệm thu nghe thực tế 10 mẫu lời đọc, gồm số/ngày/tên riêng; artifact luôn gắn đúng script revision.

## M4 — Studio và 3 template MVP (2–3 tuần)

**Phụ thuộc:** M1–M3. **Khu vực:** module `studio`, `packages/video/`, timeline contracts.

**Input → Output:** media + script + voice + brand/template → TimelineRevision và preview.

- [ ] Khóa schema scene/track/layer và quy tắc tính frame từ audio; kiểm thử biên cảnh và clip ngắn hơn voice.
- [ ] Xây storyboard, mapping tư liệu, timeline theo cảnh, trim/crop, sắp xếp và tự lưu.
- [ ] Xây intro logo/tiêu đề/voice tóm tắt, body, lower-third, sign, watermark, nguồn, phụ đề và outro tùy chọn.
- [ ] Xây 3 bộ mẫu trong tài liệu 03; xử lý font tiếng Việt, tràn chữ, mix nhạc/voice và mute tiếng gốc.
- [ ] Nghiệm thu sửa voice dài hơn cảnh, headline dài, phụ đề 2 dòng, crop chủ thể; preview phản ánh đúng các thay đổi.

## M5 — Kiểm duyệt, render và xuất file: hoàn thành MVP (1–1,5 tuần)

**Phụ thuộc:** M4. **Khu vực:** module `reviews`, `renders`, render worker, bộ xuất bản.

**Input → Output:** timeline revision được duyệt + preset → RenderSnapshot, MP4, thumbnail, SRT, metadata.

- [ ] Viết kiểm tra snapshot không đổi khi chỉnh project; retry worker không tạo hai kết quả “hiện hành”.
- [ ] Xây bước duyệt, preflight, job render, tiến độ, hủy/thử lại và danh sách phiên bản.
- [ ] Xuất MP4 và bộ metadata; kiểm tra codec/kích thước/fps/duration bằng ffprobe.
- [ ] Chạy toàn bộ kịch bản A01–A10 trong tài liệu 06, bao gồm worker bị ngắt và sửa project trong khi render.
- [ ] Cho người biên tập tạo bản tin đầu cuối, tải file để đăng thủ công lên các kênh phù hợp; ghi lỗi và chốt MVP.

## M6 — Đa định dạng và làm việc nhóm (1–2 tuần)

**Phụ thuộc:** MVP. **Khu vực:** layout/preset trong `packages/video/`, membership/review UI.

- [ ] Thêm 16:9 và 1:1, crop riêng cho từng tỷ lệ, reflow headline/phụ đề và kiểm duyệt theo layout.
- [ ] Thêm vai trò owner/editor/reviewer, lịch sử thao tác và chia sẻ brand kit.
- [ ] Thêm ticker và preset mở rộng nếu nằm trong ưu tiên được chọn.
- [ ] Nghiệm thu đổi tỷ lệ không cắt chữ/chủ thể, và editor không tự vượt quyền duyệt của nhóm.

## M7 — Xuất bản trực tiếp và lịch đăng (3–6 tuần, phụ thuộc nền tảng)

**Phụ thuộc:** MVP; bắt đầu nghiên cứu quyền API từ M0 để giảm chờ. **Khu vực:** `packages/integrations/`, module `publications`, publish worker.

**Input → Output:** renderArtifact + channel connection + metadata → Publication, remoteId và URL nếu nền tảng cung cấp.

- [ ] Xác minh tài khoản/kênh cần hỗ trợ, app registration, scope, quy trình xét duyệt và giới hạn hiện hành cho từng nền tảng.
- [ ] Thực hiện từng connector theo thứ tự đề xuất YouTube → Facebook Page → TikTok; ưu tiên thực tế có thể đổi theo kênh chính và quyền được cấp.
- [ ] Xây chọn kênh, thông tin bài đăng, quyền hiển thị, xác nhận đăng, upload, xử lý trạng thái và lịch đăng theo múi giờ.
- [ ] Kiểm thử token hết hạn, quota, upload gián đoạn, kết quả không rõ, một kênh thất bại trong khi kênh khác thành công.
- [ ] Nghiệm thu bản đăng thử với tài khoản được phép; kiểm tra URL/trạng thái thật, đối soát trước retry và hủy lịch chưa gửi.

**Điều kiện hoàn thành:** từng connector chỉ đánh dấu xong sau kiểm tra thực tế. Nếu chưa đủ quyền API, vẫn cung cấp bộ tải để đăng thủ công và ghi rõ connector đang bị chặn.

## Theo dõi tiến độ

Chi tiết chức năng đã triển khai và bằng chứng theo từng lượt nằm tại [tài liệu 10](10-implementation-status.md); hạ tầng render đề xuất nằm tại [tài liệu 11](11-render-server-requirements.md). Các checklist M0–M7 là điều kiện nghiệm thu đầy đủ, không dùng để phủ nhận chức năng local đã chạy.

| Mốc | Trạng thái | Bằng chứng |
| --- | --- | --- |
| Kho kế hoạch `/docs` | Hoàn thành tài liệu v0.1 | README và tài liệu 01–07 |
| Studio local v0.1 | done trong phạm vi chạy thử | [Trạng thái và bằng chứng hiện tại](10-implementation-status.md), build theo mốc và benchmark 60 giây/1080p |
| M0–M5 đầy đủ | in_progress | Chưa thử TTS thật, ma trận media/website, auth và hạ tầng production |
| M6–M7 | planned | Có lựa chọn tỷ lệ cơ bản; chưa có nhóm, xuất bản trực tiếp hoặc lịch đăng |

Khi triển khai, tách từng mốc thành các task có người phụ trách, ngày dự kiến, trạng thái, liên kết PR/commit và bằng chứng kiểm tra. Chỉ cập nhật ước lượng sau khi có kết quả M0 hoặc dữ liệu tiến độ thực tế.
