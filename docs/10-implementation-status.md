# 10 — Các mục đã hoàn thiện và đã sửa

Cập nhật: 03/10/2026. Phạm vi: bản chạy local của Cre-vid. “Hoàn thiện” dưới đây chỉ áp dụng cho chức năng đã triển khai và phạm vi kiểm tra được ghi rõ; chưa phải nghiệm thu hệ thống production hoặc toàn bộ lộ trình M0–M7.

## Đóng gói repository để chạy local — 03/10/2026

Đã bổ sung toàn bộ cấu hình npm/Next/TypeScript, lockfile, font, tài nguyên tham chiếu, tài liệu, kiểm thử và các demo nhỏ vào repository. Không đưa `.env.local`, `.data`, `node_modules`, `.next` hoặc khóa API lên Git. README có lệnh clone/cài/chạy và cách sao chép env trên Windows CMD; yêu cầu Node tối thiểu 22.19.0 theo dependency hiện tại. Lệnh typecheck tự sinh route types cho bản clone mới.

Kiểm chứng bằng bản sao sạch chỉ chứa file chuẩn bị commit, không dùng node_modules, env hay dữ liệu cũ: `npm ci`, `npm run typecheck`, `npm run build` đều đạt. `npm run dev` trên cổng riêng khởi động web và worker; trang chủ HTTP 200, heartbeat worker hoạt động, tạo/mở dự án và tải font thành công. Đã dừng tiến trình thử; ứng dụng đang dùng ở cổng 3000 không bị thay đổi. Kiểm tra này chạy trên macOS/Node 22.22.2; chưa kiểm tra Windows/Linux và không thay thế nghiệm thu TTS/đăng mạng xã hội bằng credentials thật.

## Chức năng đã có

| Hạng mục | Kết quả hiện tại | Bằng chứng / giới hạn |
| --- | --- | --- |
| Xuất bản Facebook Page / X | OAuth và PKCE cho X, chọn Page/tài khoản, duyệt render/caption, queue nền, liên kết bài đăng, chặn gửi trùng và trạng thái cần kiểm tra khi mất kết nối | 15 kiểm thử social, 2 E2E mới, 68 unit/integration toàn bộ đạt; TypeScript/build đạt. HTTP nền tảng giả lập; chưa đăng tài khoản thật. [Cấu hình](17-social-publishing.md) |
| Kho tài liệu dự án | Lưu yêu cầu, luồng Input/Output, kiến trúc, kế hoạch, benchmark và trạng thái trong `docs/` | [Mục lục](README.md) |
| Dự án và kịch bản | Tạo/mở/lưu, tự lưu, revision, các cảnh Intro/Body; tự chuyển Outro cũ đã sửa thành Body, chỉnh lời đọc/tiêu đề/thời lượng, thêm/xóa/sắp xếp cảnh | Đã kiểm thử lưu và mở lại; kho JSON local có khóa |
| Tư liệu | Upload ảnh/video/audio, kiểm tra định dạng, chuẩn hóa, chọn cho cảnh, crop/fit, trim và tắt tiếng gốc | 100 MB/file, 50 asset/dự án; chưa nghiệm thu mọi loại media |
| Bài báo → bản nháp | Dán URL để lấy bài, nhập tối đa 6 ảnh mới, đề xuất các đoạn và gợi ý cách đọc; chỉ thay cảnh sau khi bấm áp dụng | Trích xuất theo quy tắc, chưa dùng LLM; website chặn bot/JavaScript có thể thất bại |
| Voice | TTS local Hải Đăng/Trúc Ly (mặc định 1×), nhập audio, đo thời lượng cảnh và phát hiện lời đọc cũ | Đã sinh cả hai giọng offline, thao tác trong Studio và render MP4 có âm thanh. [Cài đặt và kiểm chứng](18-local-tts.md) |
| Hai chế độ tiêu đề | Chỉ Intro hoặc cùng tiêu đề trên toàn video | Kiểm thử Intro/Body và lưu cấu hình |
| Template | Bảy mẫu: Xanh bản đồ, Đỏ hồng, Khung bản tin, Thẻ nổi bật, Thể thao, Phim ảnh, YouTube Shorts; giữ ba mẫu đơn giản cũ | Có MP4 mẫu thật; [hướng dẫn](09-reference-styles.md) |
| Tùy chỉnh template | Màu, tên, watermark, sign, nguồn; mẫu thẻ trắng có chữ nhấn màu và tối đa hai ảnh tròn; mẫu đỏ hồng có hàng biểu tượng | Đã kiểm tra các mẫu trong trình duyệt, chữ tiếng Việt và ảnh render |
| Bố cục TikTok/Reels/Shorts | Khung điện thoại 591 × 1280 theo ảnh mẫu; video 9:16 riêng; đối chiếu ảnh gốc và bật/tắt UI | Đã đo hình học trong trình duyệt; icon/font dựng lại chưa khớp từng pixel 100%; [chi tiết](13-platform-preview-body.md) |
| Bố cục Body | Đầy khung, cửa sổ 4:3 hoặc 1:1; cùng tư liệu mờ ở vùng dư; logo + tên trong thẻ khi hiện tiêu đề, góc phải khi Body không có thẻ; Sign/Watermark bên trái | Kiểm thử tỷ lệ, lưu lại và MP4 1080p thực tế; nền video mờ không phát thêm âm thanh |
| Độ mờ Sign | Thanh 0–100% cho từng cảnh, không ảnh hưởng watermark/logo | Kiểm thử opacity, lưu/mở lại và render |
| Upload ngay trong Studio | Nút Tải logo và Tải nhạc nền; tự gắn tài nguyên vừa tải và lưu dự án | Kiểm thử upload thật, đúng loại tài nguyên và giữ lựa chọn sau reload |
| Logo và tên đồng thời | Ba chế độ: cả hai / chỉ logo / chỉ tên; tên dài tự co cho vừa | Kiểm thử trên bốn mẫu tham khảo; dùng chung BrandMark cho preview/render |
| Kích cỡ logo | Thanh 50–1000%, đặt lại 100%, lưu vào dự án và snapshot render | Kiểm thử 200% không bị cắt trong bốn mẫu, reset và mở lại mức 50% |
| Bo góc logo | 0–100%, tối đa thành khung tròn; tự giới hạn theo vùng nhận diện | Kiểm tra 1000% trên 7 phong cách ở khung dọc/ngang; dùng chung preview/render |
| Custom từ ảnh | Upload ảnh, tự lấy bảng màu, tự đặt tên, lưu và chỉnh mẫu; tùy chọn dùng nguyên ảnh trong khung | Chưa AI/OCR tách layer; thư viện theo dự án; [chi tiết](14-custom-styles-logo.md) |
| Render và tải file | Worker chạy nền theo snapshot, tiến độ/hủy; MP4 H.264/AAC, SRT, JPG, JSON bài đăng | Đã render MP4 thật; 30 fps, tỷ lệ 9:16/16:9/1:1, tối đa 180 giây; chưa kiểm hết mọi tổ hợp |

## Lỗi đã sửa và mức kiểm chứng

| Lỗi / phản hồi | Thay đổi | Trạng thái kiểm tra |
| --- | --- | --- |
| Chọn tư liệu nhưng không tải lên | Sao chép FileList thành File[] trước khi input bị reset và trước await | Có kiểm thử tái hiện trước sửa và upload thành công sau sửa |
| Chữ bị ngắt giữa từ | Chỉnh quy tắc xuống dòng và co cỡ chữ theo khung | Đã xem chữ tiếng Việt trong preview và ảnh render mẫu |
| Khung lớn, sub ở giữa che hình | Tính chiều cao theo độ dài tiêu đề, hạ cụm xuống dưới, điều chỉnh gradient; chừa nút phải và mô tả dưới | Đã đo vị trí trong trình duyệt TikTok/Reels và xuất MP4 bố cục gọn |
| Studio chỉ có danh sách logo/nhạc, thiếu nút upload | Thêm hai nút upload tại chỗ, tự chọn và lưu | Đã kiểm thử trình duyệt |
| Logo thay thế tên, không hiện cùng lúc | Thành phần BrandMark chung và tùy chọn hiển thị | Đã kiểm thử cả ba chế độ; trở ngại duyệt kiểm thử ban đầu đã được giải quyết ở lượt kiểm tra kích cỡ logo |
| Không thay được kích cỡ logo | Thêm `brand.logoScale`, mặc định 1 cho dự án cũ; mở rộng phần nhận diện khi cần | TypeScript, kiểm thử schema/layout và trình duyệt đã đạt |
| Console báo dependency useEffect đổi từ 5 sang 6 phần tử | Thêm `// @refresh reset` riêng BrandMark để remount khi chỉnh mã; dependency hiện có số phần tử cố định | Đã sửa mã, TypeScript và 9 kiểm thử model/template đạt. Chưa xác nhận hết cảnh báo trên tab đang mở vì truy cập trình duyệt bị duyệt tự động timeout; cần tải lại và xác nhận trực tiếp |

## Bằng chứng kiểm tra theo từng mốc

Mới nhất 01/10 — sửa lớp phủ: 42 unit/integration (có MP4 thật), 12 E2E, TypeScript và build đạt. Đo tọa độ khi chuyển nền tảng và so sánh pixel vùng tiêu đề trước/sau chèn ảnh. [Chi tiết](15-overlay-corrections.md).

Mốc logo/custom: 42 unit/integration (gồm render thật), 10 E2E, TypeScript và build đạt. Sau bổ sung giới hạn chiều cao logo, đã chạy lại hai E2E liên quan, gồm 1000%/tròn trên 7 phong cách và 2 tỷ lệ. Có MP4 mẫu custom 1080p; xem [tài liệu 14](14-custom-styles-logo.md).

Mốc Body/nền tảng 30/09: 38 unit/integration (có render MP4 thật), 9 E2E, TypeScript và production build đạt. Render thêm MP4 Body 1080p 2 giây gồm 4:3 và 1:1; đã xem ảnh và kiểm tra âm thanh không nhân đôi. Sau rà soát cuối, kiểm thử Body mở rộng qua cả 7 phong cách và build được chạy lại, đều đạt. Xem [bố cục nền tảng và Body](13-platform-preview-body.md).

Mốc trước: bổ sung ba phong cách [Thể thao, Phim ảnh, Shorts](12-themed-styles.md). Toàn bộ 34 unit/integration, 8 E2E, TypeScript và build đạt; ba MP4 1080p đã render và xem ảnh xuất. Kiểm thử logo 200% đã mở rộng qua cả 7 mẫu thiết kế. Các dòng dưới giữ lịch sử trước mốc này.

- Bản local ban đầu: build, TypeScript, 22 unit/integration và 1 E2E; benchmark 60 giây.
- Sau bố cục nền tảng: 32 unit/integration, 6 E2E, TypeScript và production build đạt; render mẫu gọn 1080×1920 thành công.
- Sau upload/nhận diện/kích cỡ logo: kiểm thử E2E liên quan đạt, bao gồm logo + tên, cả bốn mẫu, 50–200%, lưu/mở lại; TypeScript và 9 kiểm thử model/template đạt.
- Sau chỉnh Fast Refresh: TypeScript và 9 kiểm thử model/template đạt; không có lần chạy lại toàn bộ E2E/build sau thay đổi cuối này.
- Các kết quả trên là lịch sử kiểm tra trong phiên triển khai, các mốc cũ không thay thế kết quả chạy mới nhất được ghi ở đầu mục.

Mã liên quan: [Studio](../src/components/Studio.tsx), [BrandMark](../src/video/BrandMark.tsx), [layout](../src/video/layout.ts), [render](../src/lib/render.ts), [kiểm thử trình duyệt](../tests/e2e/studio.spec.ts).

## Còn lại trước nghiệm thu đầy đủ

1. Xác nhận cảnh báo Fast Refresh đã hết trên tab người dùng sau reload.
2. Nghe và duyệt chất lượng hai giọng local theo nội dung thực tế; gợi ý nhấn giọng hiện chưa điều khiển cảm xúc TTS tự động.
3. Chốt website báo hỗ trợ và kiểm thử nguồn thật; nghiệm thu ma trận clip xoay/VFR/âm thanh/tỷ lệ/tiêu đề dài. Phụ đề hiện ước lượng theo câu, chưa căn từng từ theo âm thanh.
4. Chạy benchmark hỗn hợp ảnh + clip + voice + nhạc trên máy chủ đích. Chưa có số đo tải CPU/RAM đỉnh trên VPS.
5. Bổ sung đăng nhập, phân quyền, persistence/queue production, backup và quy trình triển khai trước khi mở cho nhóm qua Internet. Bản hiện tại single-user/local, một job chạy mỗi lần.
6. Facebook Page Reels và X đã có tích hợp local; cần cấu hình developer app và nghiệm thu bằng tài khoản thật. TikTok/YouTube và lịch hẹn đăng chưa tích hợp. Xem [tài liệu 17](17-social-publishing.md).
7. Review độc lập và nghiệm thu toàn bộ M0–M7 chưa hoàn tất.

Xem [cấu hình máy chủ render](11-render-server-requirements.md) để lập ngân sách hạ tầng.


## Cập nhật dải thương hiệu — 01/10/2026

- Thêm cỡ tên thương hiệu 50–300%, lưu theo dự án, độc lập với kích cỡ logo.
- Mẫu Xanh bản đồ giữ nửa viên thuốc sát mép trái, cao theo chữ, viền trắng đặc 1 px; logo và dòng tên căn cùng đáy.
- TypeScript và 14 kiểm thử model/bố cục đạt. 4 E2E đạt ở mốc trước chỉnh căn đáy/viền; sau chỉnh đã đo trực tiếp trên tab local, xác nhận đáy logo/chữ bằng nhau và viền 1 px trắng.
- Render MP4 bổ sung chưa thực hiện: hệ thống duyệt tự động báo workspace hết credits. Chi tiết tại [tài liệu 15](15-overlay-corrections.md).


## Loại giao diện từ ảnh — 02/10/2026

Thêm bộ chọn trước tải ảnh: Tiêu đề 1/3 Intro / Popup. Có thể đổi loại trên mẫu đã tạo, lưu riêng theo mẫu; mẫu cũ mặc định popup. Bố cục 1/3 tràn ngang và chạm đáy; popup giữ lề và bo góc. Dùng chung preview/render, tôn trọng Chỉ Intro / Toàn video. TypeScript và 15 kiểm thử model/bố cục đạt; kiểm tra trình duyệt thực tế: upload, đo tỷ lệ 1/3, chuyển popup, lưu/mở lại thành công. E2E đã bổ sung nhưng chưa chạy lại; chưa render MP4 bổ sung. Chi tiết tại [tài liệu 14](14-custom-styles-logo.md).


## Chiều cao và vị trí khung — 02/10/2026

Hoàn thiện hai thanh chỉnh trong Studio: chiều cao 50–200%, dịch dọc ±30% chiều cao video. Thiết lập lưu riêng cho phong cách và từng mẫu/loại custom; có đặt lại. Nền 1/3 mở rộng lên trên, popup thay chiều cao và vị trí, phụ đề đi theo; logo không bị kéo giãn. Giới hạn giữ khung trong video và chừa khoảng phụ đề. Xem [tài liệu 14](14-custom-styles-logo.md).

Đã đạt TypeScript, 21 kiểm thử model/bố cục, 5 E2E liên quan và render MP4 2 giây với khung đã chỉnh. Chưa chạy lại toàn bộ suite hoặc production build ở mốc này. Trở ngại duyệt tự động của mốc trước không còn chặn lần render kiểm chứng này.


## Nhiều ảnh/video và chuyển động Body — 02/10/2026

Hoàn thiện upload hỗn hợp để mỗi ảnh/video tạo một cảnh Body, thêm lời đọc trực tiếp trong thuộc tính cảnh, bốn hiệu ứng ảnh (zoom vào/ra, lướt trái/phải), cường độ chuyển động, tỷ lệ gốc nguồn và dịch cửa sổ tư liệu. Các cảnh có text/voice và thiết lập riêng; giữ các cảnh đã có. Video có crop X/Y, giữ toàn hình, chọn mốc bắt đầu và tắt âm gốc.

TypeScript và 53 unit/integration đạt. 15 E2E đã đạt qua lượt toàn bộ và chạy lại 4 selector upload sau khi tách input thư viện/tạo cảnh. MP4 2 giây từ ảnh chuyển động nối video thật xuất thành công, hai frame của ảnh có dữ liệu pixel khác nhau. Chưa kiểm tra TTS thật hoặc production build ở mốc này. Chi tiết và hướng dẫn: [tài liệu 16](16-body-media-motion.md).
