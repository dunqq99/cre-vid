# Cre-vid — Newsroom Studio

Bản local v0.1 để dựng video bản tin từ ảnh/video, kịch bản và giọng đọc theo từng cảnh. Kế hoạch toàn dự án nằm trong [docs](docs/README.md).

## Chạy trên máy

Yêu cầu Git, Node.js 22 từ **22.19.0** trở lên (hoặc Node 24/26), npm và Chrome để render. Đã kiểm tra trên macOS Apple Silicon. FFmpeg/ffprobe được cài qua npm; lần cài đầu cần Internet.

```sh
git clone --branch codex/news-studio https://github.com/dunqq99/cre-vid.git
cd cre-vid
npm ci
cp .env.example .env.local
npm run dev
```

Trên **Windows CMD**, dùng `copy .env.example .env.local` thay cho `cp`. Khi cập nhật một bản đã cài, chạy `git pull` và `npm ci`; giữ nguyên `.env.local` và `.data` của bạn.

Ứng dụng mở và dựng video local được khi chưa có khóa API. Tạo giọng AI và đăng Facebook/X cần cấu hình riêng; có thể nhập file giọng đọc của bạn. Repository có mã nguồn, font, ảnh tham chiếu, cấu hình, tài liệu, kiểm thử và video demo nhỏ; không chứa dữ liệu dự án cá nhân, token, `.env.local`, `node_modules` hay `.next`.

Mở **http://127.0.0.1:3000**. Lệnh trên chạy cả web và worker render. Giữ terminal chạy; đóng tab không dừng job. Dừng bằng Ctrl+C. Dữ liệu dự án, media, lịch sử và file render lưu trong `.data/`; sao lưu cả thư mục này khi cần.

Nếu Chrome ở vị trí khác, đặt `CHROME_PATH` trong `.env.local`. Không có Chrome tại đường dẫn macOS mặc định thì Remotion có thể cần tải browser ở lần render đầu. Chỉ chạy một bộ web/worker cho cùng thư mục dữ liệu.

Ví dụ Windows: `CHROME_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe`. Với Linux, đặt đường dẫn Chrome/Chromium đã cài trên máy và cài thư viện hệ thống mà trình duyệt yêu cầu. Chưa kiểm chứng khởi chạy trên Windows/Linux trong phiên này.

Chạy bản tối ưu local: `npm run build`, sau đó `npm start`. Lệnh `npm run typecheck` tự tạo kiểu route Next.js, nên dùng được cả khi vừa clone chưa có thư mục `.next`.

## Thử một bản tin

1. **Input:** thêm ảnh/video hoặc dán URL bài báo. Khi dán URL, ứng dụng tự trích nội dung, nhập tối đa 6 ảnh mới và đề xuất kịch bản. Xem bản nháp trong Kịch bản rồi chọn **Dùng bản nháp & gắn ảnh**; cảnh cũ chỉ được thay sau thao tác này. Có thể nhập thủ công nếu website chặn truy cập.
2. **Kịch bản:** chọn cảnh trên timeline, sửa tiêu đề, lời đọc và nguồn. Thêm, xóa hoặc sắp xếp cảnh; dữ liệu tự lưu.
3. **Voice:** nhập MP3/WAV cho cảnh, hoặc tạo TTS khi đã cấu hình nhà cung cấp. Cảnh tự dài ra theo audio. Đổi lời đọc sẽ yêu cầu làm lại voice.
4. **Studio:** chọn **Chỉ Intro** (khung tiêu đề chỉ xuất hiện ở cảnh mở đầu) hoặc **Toàn video** (giữ một tiêu đề xuyên suốt). Phụ đề nằm trên khung tiêu đề; nhãn/sign nằm phía trên bên trái, chừa lề phải và đáy tránh giao diện nền tảng. Có bảy mẫu thiết kế (gồm Thể thao, Phim ảnh, YouTube Shorts) và ba mẫu đơn giản. Chọn UI tham chiếu TikTok/Reels; tải logo/nhạc trực tiếp, chọn logo + tên hoặc một trong hai, chỉnh kích cỡ logo 50–200%, màu và watermark. Thuộc tính cảnh cho phép chỉnh thời lượng, nhãn, crop và điểm bắt đầu clip.
5. **Output:** xem trước, duyệt nội dung và chọn bản nháp hoặc 1080p. Tải MP4, SRT, ảnh bìa và nội dung bài đăng khi hoàn tất. Phần **Xuất bản** cho phép kết nối Facebook Page/X, chọn bản render chính, duyệt caption và đăng qua worker. Xem [hướng dẫn cấu hình](docs/17-social-publishing.md).

Hỗ trợ 9:16, 16:9 và 1:1; video cuối tối đa 180 giây. Media đầu vào tối đa 100 MB/file, 50 file/dự án. Clip ngắn được lặp; tiếng gốc có thể tắt. Thời điểm phụ đề hiện là ước lượng theo độ dài câu, chưa căn chính xác từng từ theo âm thanh.

## Giọng Ngọc Huyền và AI

Adapter Vbee dùng API thật, mặc định mã Ngọc Huyền `hn_female_ngochuyen_full_48k-fhg`. Cấu hình `VBEE_APP_ID`, `VBEE_TOKEN`, `VBEE_VOICE_CODE` từ tài khoản Vbee được cấp quyền trong `.env.local`, rồi khởi động lại. API realtime đang giới hạn 300 ký tự/đoạn; dùng nút chia đoạn khi cần.

Adapter Azure cần `AZURE_SPEECH_KEY` và `AZURE_SPEECH_REGION`. Khóa chỉ ở server, không nhập vào trình duyệt hoặc commit Git. Chưa kiểm chứng gọi TTS thật do chưa có tài khoản/khóa; kiểm thử hiện xác nhận cấu trúc request, giới hạn và xử lý văn bản. Nhập audio có sẵn hoạt động độc lập với TTS.

Tài liệu chính thức: [Vbee realtime API](https://api-docs.vbee.vn/vbee-api/text-to-speech/realtime-api).

## Render và tốc độ

Web lưu một snapshot phiên bản đã duyệt vào hàng đợi. Worker dựng hình bằng Remotion, ghép âm thanh/mã hóa H.264 + AAC, sau đó kiểm tra file bằng ffprobe và tạo bộ xuất bản. Preview và render dùng chung composition. Lần đầu có bước chuẩn bị engine; các job sau dùng lại bundle trong worker.

Đo trên Apple M4, 10 lõi, RAM 16 GB: video **60 giây, 1080×1920, 30 fps mất 100,3 giây**. Fixture có 3 cảnh, nền vector, tiêu đề, watermark và chữ tiếng Việt; **không có video tải lên hoặc TTS**. Đây là một phép đo, không phải cam kết cho mọi video. Xem [báo cáo benchmark](docs/benchmarks/local-render.json). Bản nháp render ở 1/3 kích thước để duyệt nhanh hơn; chưa có số đo so sánh chính thức.

## Kiểm tra và phạm vi

```sh
npm test
npm run typecheck
npm run build
# Khi npm run dev đang chạy:
npm run test:e2e
```

Ở mốc bố cục TikTok/Reels đã chạy 32 kiểm thử tự động (có render MP4 thật), 6 kiểm thử trình duyệt: sửa/lưu/mở lại/tải SRT, upload ảnh, hai chế độ tiêu đề và dán URL/duyệt bản nháp, typecheck và production build. Các lượt sau bổ sung kiểm thử upload logo/nhạc và nhận diện; kết quả theo từng mốc nằm tại [trạng thái triển khai](docs/10-implementation-status.md). Không coi các số trên là lần chạy lại toàn bộ sau sửa cuối. E2E tạo dự án kiểm thử riêng. Xem [nhật ký triển khai](docs/plans/2026-09-29-local-studio.md).

Bản này dành cho một người chạy local, chưa có đăng nhập, phân quyền nhóm hoặc PostgreSQL/Redis/S3. Facebook Page Reels và X đã có adapter đăng trực tiếp, cần cấu hình developer app và nghiệm thu bằng tài khoản thật; TikTok/YouTube vẫn tải file đăng thủ công. Chưa nghiệm thu toàn bộ ma trận media/website/nền tảng trong kế hoạch sản phẩm; nhập bài có thể thất bại với trang chặn bot hoặc tải nội dung bằng JavaScript. Không mở bản local này ra Internet.

## Cập nhật luồng biên tập

- Đã sửa lỗi chọn file rồi không upload: sao chép FileList trước khi xóa giá trị input và chờ lưu dự án. Kiểm thử tái hiện lỗi trước khi sửa và upload thành công sau sửa.
- Đề xuất kịch bản hiện là trích xuất theo quy tắc, không phải LLM: tiêu đề nguồn làm lời mở đầu thu hút, tối đa 6 đoạn nội dung và một đoạn kết. Không tự thêm số liệu hoặc tuyên bố giật gân. Bài dài chỉ lấy phần đầu để tạo nháp và có thông báo cần xem lại nguồn.
- Có gợi ý cách đọc/nhấn giọng riêng từng cảnh. Hướng dẫn này dành cho biên tập viên; TTS adapter hiện nhận text và tốc độ, chưa có điều khiển cảm xúc theo chỉ dẫn tự do.
- Ảnh từ bài báo được tải về kho local và giữ URL nguồn. Chỉ hỗ trợ JPEG/PNG/WebP; bỏ qua ảnh trùng, giới hạn 12 MB/ảnh nguồn, kiểm tra public IP trên từng chuyển hướng và không cho tải qua địa chỉ nội bộ. Ảnh lỗi không làm mất bản nháp kịch bản.
- Lề hiển thị là lựa chọn biên tập, không bảo đảm tránh mọi giao diện mở rộng. TikTok cũng nêu vùng an toàn thay đổi theo tỷ lệ, độ dài caption và thành phần bổ sung: [hướng dẫn chính thức](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en-GB).

## Bốn phong cách theo ảnh tham khảo

Studio đã có **Xanh bản đồ**, **Đỏ hồng**, **Khung bản tin** và **Thẻ nổi bật**. Mỗi mẫu dùng được ở Intro hoặc toàn video. Mẫu trắng có hai ảnh tròn theo cảnh và tô màu cụm từ; logo/nội dung là dữ liệu chỉnh sửa được. Xem [hướng dẫn và ảnh render](docs/09-reference-styles.md).

## Trạng thái và cấu hình máy chủ

- [Các mục đã hoàn thiện, đã sửa và còn lại](docs/10-implementation-status.md).
- [Yêu cầu máy chủ render](docs/11-render-server-requirements.md): đề xuất khởi đầu 8 vCPU / 16 GB RAM / NVMe 200 GB, chưa cần GPU; cần benchmark VPS bằng media thực tế trước khi chốt.

## Ba phong cách mới

Studio có thêm **Thể thao**, **Phim ảnh**, **YouTube Shorts**. Xem [hướng dẫn và MP4 mẫu](docs/12-themed-styles.md). Sau bổ sung này: 34 unit/integration, 8 E2E, TypeScript và production build đạt; đã kiểm tra logo 200% trên cả 7 mẫu thiết kế.
