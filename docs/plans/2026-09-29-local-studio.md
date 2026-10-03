# Triển khai Studio chạy local

Người dùng yêu cầu triển khai ngày 2026-09-29. Tham chiếu: tài liệu 01–08.

## Quyết định thực hiện

- Ruling: khởi tạo Git riêng ở Cre-vid trên nhánh codex/news-studio vì Git kế thừa từ thư mục home, không chứa dự án. Không sửa kho home.
- Ruling: giao bản local dùng Next.js, worker riêng và kho file JSON ghi nguyên tử/có khóa, thay PostgreSQL/Redis/S3 ở lần chạy đầu. Lý do: môi trường chưa có dịch vụ và cần đo render ngay. Chi phí: trước khi public cho nhiều người phải chuyển persistence, xác thực và queue sang hạ tầng production. Server mặc định chỉ bind loopback.
- Ruling: giữ mã theo module trong src thay monorepo ban đầu để có một lệnh chạy; model và composition dùng chung giữa web/worker.
- Ruling: TTS thật qua Azure/Vbee khi có khóa; upload audio chạy ngay. Không giả lập tiếng Ngọc Huyền, không cam kết kết nối nhà cung cấp đã kiểm chứng khi thiếu tài khoản.

## Checklist kỹ thuật

- [x] Task 1: model/timeline/validation, optimistic revision và snapshot. Test duration theo audio, stale voice, conflict, snapshot bất biến.
- [x] Task 2: upload/probe, nhập bài an toàn, TTS adapter, API CRUD và queue. Test SSRF, file/ID validation, nhập nguồn và lỗi provider.
- [x] Task 3: composition chung, render worker, output MP4/SRT/thumbnail/metadata. Test bằng render thật và ffprobe.
- [x] Task 4: giao diện Studio tiếng Việt, cảnh, template, brand, voice, review và output. Playwright tạo/sửa/lưu/tải và thử lỗi.
- [x] Task 5a: build, benchmark local, hướng dẫn chạy và cập nhật trạng thái.
- [ ] Task 5b: review độc lập và nghiệm thu đầy đủ các giới hạn còn lại.

## Hợp đồng giữa module

model.ts cung cấp Project/Scene/Asset/Job, tính timeline 30 fps và validate. store.ts quản lý version và job dưới data root. media.ts probe/normalize upload. integrations.ts lấy nội dung nguồn/TTS. video/NewsVideo.tsx dùng Project + URL media cho Player và renderer. worker.ts đọc snapshot trong job, không đọc project đang bị sửa.

## Nhật ký thực hiện

- Bắt đầu: Node 22.22.2, macOS arm64; có Chrome, chưa có ffmpeg trong PATH. Chưa có baseline test hoặc mã ứng dụng.

- Hoàn thành model, store ghi nguyên tử/có khóa, snapshot revision, kiểm tra voice cũ, queue một job chạy mỗi lần và hủy job.
- Hoàn thành API, ingest media (chỉ parser định dạng đã cho phép, không mở network protocol), nhập bài chống SSRF/DNS rebinding, Vbee/Azure adapter. Request TTS được kiểm thử, chưa gọi tài khoản thật.
- Hoàn thành composition chung, 3 template, font tiếng Việt, logo/watermark/sign, voice/nhạc, worker và bộ MP4/SRT/JPG/JSON. Đã xem thumbnail render thật, font và bố cục hiển thị đúng.
- Studio tiếng Việt: nhập, biên tập, chọn tư liệu, preview, timeline, tự lưu, duyệt/render, tiến độ và tải file. Thuộc tính cảnh có thể cuộn tới trên cửa sổ hẹp.
- Kiểm tra cuối: `npm test` 22/22 đạt; `npm run typecheck` đạt; `npm run build` đạt; `npm run test:e2e` 1/1 đạt (sửa/lưu/mở lại/tải SRT trên dự án riêng).
- Benchmark 60 giây, 1080x1920, 30 fps: 100,3267 giây trên Apple M4/16 GB, concurrency 2. Fixture chưa có media upload/TTS; không ngoại suy tốc độ cho video thực tế. Báo cáo: docs/benchmarks/local-render.json.
- Task 5: build, benchmark và hướng dẫn đã hoàn tất. Review độc lập chưa thực hiện được vì agent review báo hết credit workspace; đã tự rà soát và sửa lỗi DNS lookup, hủy voice, queue, lưu đồng thời, parser media và ducking nhạc. Không coi tự rà soát là review độc lập.
- Giới hạn bàn giao: single-user/local, file 100 MB/50 asset, phụ đề timing ước lượng, chưa có tài khoản TTS, chưa kiểm thử đầy đủ nguồn báo/media/đa tỷ lệ, chưa kết nối xuất bản xã hội. M0–M7 chưa nghiệm thu toàn bộ.
- Giữ server tại http://127.0.0.1:3000 để người dùng xem trước. Kho Git riêng chưa có remote; không push/merge trong lần bàn giao local.


## Điều chỉnh theo phản hồi bản local

- Hai chế độ `titleMode`: intro/all; tiêu đề chung `newsTitle`, fallback tiêu đề Intro. Body/outro không có khung ở intro-only; toàn video dùng cùng title. Phụ đề nằm phía trên, nhãn tách ra phía trên trái. Bỏ ngắt giữa từ gây rơi một ký tự xuống dòng như ảnh phản hồi.
- Lỗi upload được xác nhận: FileList còn tham chiếu input đã reset trong khi đợi save. Copy File[] đồng bộ trước await. Regression browser fail trước sửa, pass sau sửa.
- URL paste tự lấy bài, nhập tối đa 6 ảnh mới (public URL, redirect/DNS kiểm tra, giới hạn dung lượng), trả lỗi ảnh riêng và đề xuất script. Apply draft là bước rõ ràng trước thay cảnh hiện tại; ảnh tự gắn vào cảnh.
- Script draft dùng trích xuất theo quy tắc, không LLM; nguồn văn bản được coi là dữ liệu. Có hook từ tiêu đề thật, các đoạn <=300 ký tự và gợi ý đọc/nhấn giọng. Chưa gọi TTS thật do chưa có credential.
- Kiểm tra: 27 unit/integration tests (có render MP4), typecheck, production build. Browser: upload ảnh thật, lưu/mở lại, title intro/body/outro, caption trên title và đề xuất từ thao tác paste. Test URL dùng fixture phản hồi để ổn định; chưa khẳng định tất cả báo đều hỗ trợ.

## Tổng hợp sau các phản hồi Studio

Đã bổ sung bốn template, bố cục tham chiếu TikTok/Reels và thẻ gọn, upload logo/nhạc tại Studio, ba chế độ nhận diện và kích cỡ logo 50–200%. Đã chỉnh Fast Refresh cho BrandMark; việc xác nhận cảnh báo hết trên tab người dùng còn chờ. Danh sách chi tiết, lỗi đã sửa và mức kiểm chứng: [tài liệu 10](../10-implementation-status.md). Đề xuất CPU/RAM/SSD và kế hoạch đo trên VPS: [tài liệu 11](../11-render-server-requirements.md). Không có triển khai server hoặc thay cấu hình render trong lượt cập nhật tài liệu này.
