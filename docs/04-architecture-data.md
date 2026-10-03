# 04 — Kiến trúc và dữ liệu

> Trạng thái hiện tại: web Next.js, Remotion/FFmpeg và worker đã chạy local; dữ liệu/queue dùng file JSON có khóa. PostgreSQL/Redis/S3, xác thực và triển khai Linux bên dưới vẫn là thiết kế production. Xem [tài liệu 10](10-implementation-status.md) và [máy chủ render](11-render-server-requirements.md).

## So sánh phương án

| Phương án | Ưu điểm | Đánh đổi | Kết luận |
| --- | --- | --- | --- |
| Web Studio + worker render phía server | Dùng chung dự án, trình duyệt không phải gánh render cuối, dễ quản lý phiên bản | Cần máy xử lý và kho media | Đề xuất; phù hợp web cá nhân/nhóm nhỏ đã xác nhận |
| Web xử lý hoàn toàn trong trình duyệt | Ít hạ tầng server, file có thể ở máy người dùng | Phụ thuộc RAM, trình duyệt, tab đang mở; render dài khó ổn định | Chỉ cân nhắc cho preview/tác vụ nhẹ |
| Desktop dùng tài nguyên máy cá nhân | Khai thác file và CPU cục bộ | Cài đặt/cập nhật, chia sẻ nhóm phức tạp hơn | Phương án tương lai nếu nhu cầu offline xuất hiện |

## Kiến trúc đề xuất

Web/API là một ứng dụng theo module; worker là tiến trình độc lập. MVP không cần tách mỗi nghiệp vụ thành microservice.

| Thành phần | Công nghệ đề xuất | Trách nhiệm |
| --- | --- | --- |
| Web Studio và API | Next.js, React, TypeScript | Trang dự án, biên tập, xác thực, lưu metadata, API cùng ứng dụng |
| Cơ sở dữ liệu | PostgreSQL | Dự án, revision, timeline, trạng thái job, quyền truy cập |
| Hàng đợi | Redis + BullMQ | Điều phối import, TTS, proxy, render; retry và giới hạn song song |
| Worker | Node.js/TypeScript, container Linux | Tác vụ dài; tách khỏi vòng đời request web |
| Preview/composition | Remotion Player và composition React | Biểu diễn cảnh và đồ họa nhất quán giữa preview và render |
| Xử lý media | FFmpeg và ffprobe | Metadata, proxy, chuẩn hóa media, audio và kiểm tra file |
| Kho file | Object storage tương thích S3 | Bản gốc, proxy, audio, render, thumbnail; URL truy cập có thời hạn |
| TTS | Adapter; ưu tiên thử Ngọc Huyền/Vbee, đối chiếu Azure Speech | Tạo giọng tiếng Việt theo đoạn, có thể thay nhà cung cấp; xem tài liệu 08 |
| Kiểm tra | Vitest, Playwright, fixture media và ffprobe | Logic, luồng Studio và file xuất thực tế |

Bảng trên mô tả kiến trúc đích; mức đã triển khai của từng phần được phân biệt trong ghi chú đầu tài liệu. Remotion cung cấp Player để nhúng video tương tác; cần kiểm tra giấy phép cho mô hình sản phẩm trước khi chốt. Xem [Player](https://www.remotion.dev/docs/player) và [giấy phép Remotion](https://www.remotion.dev/license). FFmpeg cung cấp pipeline chuyển đổi/lọc media phù hợp các tác vụ xử lý nêu trên: [tài liệu FFmpeg](https://ffmpeg.org/ffmpeg.html).

Azure công bố các giọng `vi-VN`, có thể dùng làm ứng viên cho thử nghiệm. Chất lượng đọc tên riêng, chữ viết tắt và chi phí thực tế phải đo bằng mẫu của dự án: [hỗ trợ ngôn ngữ Azure Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts).

## Luồng kỹ thuật

1. Web xin quyền upload từ API; file đi vào object storage, DB ghi Asset.
2. API ghi job vào DB và outbox trong cùng transaction; bộ phát đưa job lên queue. Có đối soát job chưa được enqueue để tránh mất việc khi Redis tạm lỗi.
3. Worker đọc Input bằng ID nội bộ, xử lý và ghi Output vào đường dẫn tạm; xác minh rồi công bố artifact. Job có khóa chống trùng và lease/heartbeat.
4. Web lấy tiến độ qua polling trước; chỉ thêm SSE khi cần. Output thành công xuất hiện trong đúng công đoạn và revision.
5. Render tạo snapshot bất biến chứa timeline, asset references, template/brand version, font, preset và phiên bản engine. Worker chỉ đọc snapshot này.
6. Publisher sử dụng RenderArtifact đã duyệt; mỗi kênh có job và trạng thái riêng.

## Mô hình dữ liệu

| Entity | Trường cốt lõi | Quan hệ/quy tắc |
| --- | --- | --- |
| User / Workspace / Membership | userId, workspaceId, role | MVP workspace cá nhân; giai đoạn nhóm có owner/editor/reviewer |
| Project | id, workspaceId, title, aspectRatio, currentRevision | Mọi truy vấn phải kiểm tra workspace membership |
| Asset | id, projectId, type, storageKey, checksum, metadata, sourceId | Giữ bản gốc; các derivative tham chiếu asset gốc |
| SourceArticle | id, projectId, url, title, body, author, publishedAt, fetchedAt | Trường không trích được lưu null; nội dung HTML luôn được làm sạch |
| ScriptRevision / ScriptSegment | revisionId, segmentId, order, kind, spokenText, displayText, sourceRefs | Các revision bất biến; ID đoạn ổn định để tái sử dụng voice |
| VoiceClip | id, segmentId, scriptRevision, provider, voiceId, settings, assetId, durationMs, timing | Ràng buộc với đúng nội dung đã tổng hợp |
| BrandKitVersion | id, brandId, version, logoRefs, colors, fontRefs, style | Áp dụng theo version, không tự sửa dự án cũ |
| TemplateVersion | id, templateId, version, slots, layouts, schemaVersion | Bản dự án lưu đúng version; có migration khi đổi schema |
| TimelineRevision | id, projectId, fps, scenes, tracks, brandVersion, templateVersion | Cảnh/layer tham chiếu asset và voice ID; không nhúng file binary |
| Job / Artifact | id, kind, inputRefs, state, attempt, error, outputRefs | Job và artifact có trạng thái tách biệt như tài liệu 02 |
| ReviewRecord | id, reviewerId, revisionId, presetId, decision, timestamp | Duyệt gắn với đúng bố cục/tỷ lệ; sửa nội dung làm mất hiệu lực duyệt |
| RenderSnapshot / RenderArtifact | snapshotId, revisionId, preset, engineVersion, fileRefs, checksum | File xuất không bị sửa khi project tiếp tục chỉnh |
| ChannelConnection / Publication | platform, accountId, tokenRef; artifactId, metadataRevision, remoteId, state | Token mã hóa ở server; mỗi đích đăng có bản ghi riêng |

Chuẩn thời gian: DB lưu UTC; giao diện hiển thị theo múi giờ workspace. Audio timing lưu milliseconds; timeline dùng số frame nguyên với `fps = 30` mặc định MVP. Quy tắc đổi audio sang frame: làm tròn lên để không cắt mất lời, rồi tính lại vị trí các cảnh sau. Tỷ lệ và preset thuộc snapshot, không đọc từ project đang thay đổi.

## API dự kiến

Đây là hợp đồng định hướng; chi tiết request/response sẽ được khóa trong kế hoạch phân hệ trước khi viết code.

| API | Input chính | Output |
| --- | --- | --- |
| `POST /api/projects` | title, aspectRatio, brandVersionId, templateVersionId | projectId |
| `POST /api/projects/:id/assets/uploads` | filename, mediaType, size | assetId, signedUploadUrl |
| `POST /api/projects/:id/assets/:assetId/complete` | upload confirmation | jobId để xác minh/probe |
| `POST /api/projects/:id/sources/import` | url hoặc text | jobId hoặc sourceId |
| `POST /api/projects/:id/scripts/revisions` | baseRevision, segments | scriptRevisionId hoặc lỗi conflict |
| `POST /api/projects/:id/voice-jobs` | scriptRevisionId, segmentIds, provider settings | jobId |
| `POST /api/projects/:id/timelines/revisions` | baseRevision, scene/track data | timelineRevisionId hoặc conflict |
| `POST /api/projects/:id/reviews` | timelineRevisionId, presetId, decision | reviewId |
| `POST /api/projects/:id/render-jobs` | timelineRevisionId, presetId, reviewId | jobId, snapshotId |
| `GET /api/jobs/:id` | ID và quyền truy cập | state, progress, outputRefs, error |
| `POST /api/projects/:id/publications` | renderArtifactId, channelId, metadata, publishAt | publicationId |

Các lệnh tạo job nhận `Idempotency-Key`; DB lưu hash của payload để từ chối cùng khóa nhưng khác yêu cầu. API job trả nhanh, không giữ HTTP request chờ render. Chỉnh sửa dùng optimistic concurrency; hai tab sửa cùng revision nhận conflict và có lựa chọn nạp lại, không âm thầm ghi đè.

## Tổ chức mã nguồn dự kiến

```text
apps/web/                 Studio, xác thực và API theo module
apps/worker/              Các processor import, proxy, TTS, render, publish
packages/contracts/       Schema và kiểu dữ liệu dùng chung
packages/video/           Composition, template, layout và font
packages/database/        Schema DB và migration
packages/integrations/    TTS, nguồn báo và social connectors
tests/fixtures/           Media/kịch bản giả lập nhỏ, nguồn sử dụng rõ ràng
tests/e2e/                Các hành trình nghiệm thu
docs/                     Kế hoạch, thiết kế và quyết định
```

## Ranh giới dữ liệu và an toàn vận hành

- Kiểm tra quyền trên project, asset, job và artifact ở server; URL ký không thay thế kiểm tra quyền.
- Import URL chỉ cho HTTP/HTTPS; chặn localhost, IP private/link-local, endpoint metadata và kiểm tra lại DNS/redirect. Giới hạn thời gian, số redirect và dung lượng phản hồi.
- Nội dung website/ảnh/tài liệu là dữ liệu, không phải lệnh cho hệ thống. Nếu bổ sung AI, chỉ xử lý trong phạm vi biên tập và không để nội dung nguồn kích hoạt công cụ.
- Worker đọc các file đã upload theo ID; không chạy chuỗi shell từ nội dung người dùng, không cho template tùy ý thực thi mã.
- Giới hạn file upload đề xuất 500 MB/file, tối đa 50 asset/dự án MVP; cấu hình được, thử nghiệm ở M0. Kiểm tra loại thực tế và khả năng decode, không chỉ phần mở rộng.
- Mỗi nguồn có trường ghi quyền sử dụng/ghi công do biên tập viên quản lý; có trạng thái chưa xác nhận để duyệt trước khi đăng. Không tự lấy tài nguyên của website chỉ vì có URL bài báo.
- Secret nằm ở server; log che token, URL ký và nội dung nhạy cảm. Render container có giới hạn CPU/RAM/thời gian và thư mục tạm riêng.
