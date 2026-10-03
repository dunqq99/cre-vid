# 11 — Yêu cầu máy chủ render

Cập nhật: 29/09/2026. Căn cứ: mã đang dùng, benchmark local đã lưu và tài liệu Remotion chính thức. Chưa thử trên VPS; cấu hình dưới đây là đề xuất khởi điểm của dự án, không phải cấu hình tối thiểu được Remotion chứng nhận hoặc cam kết thời gian render.

## Có cần CPU mạnh không?

Có: CPU ảnh hưởng đáng kể tới thời gian xuất video. Với video bản tin 1080p ngắn, chưa cần máy hàng chục lõi hoặc GPU đắt tiền ngay từ đầu. Nên ưu tiên CPU thế hệ mới có hiệu năng từng lõi tốt, đủ RAM và SSD NVMe; sau đó đo trên nội dung thực tế.

Đề xuất khởi đầu dùng thường xuyên: **8 vCPU, 16 GB RAM, 200 GB SSD NVMe, chưa cần GPU**, một job mỗi lần. Nếu chỉ thử nghiệm và chấp nhận chờ, thử **4 vCPU, 8 GB RAM, 100 GB SSD** trước. Không chọn gói 1–2 vCPU / 2–4 GB RAM làm cấu hình mục tiêu cho web và render 1080p dùng chung máy.

## Vì sao render dùng tài nguyên?

Pipeline thực tế tại [render.ts](../src/lib/render.ts):

1. Chuẩn bị bundle và snapshot dự án; bundle được dùng lại trong cùng tiến trình worker.
2. Chrome/Chromium dựng khung hình từ React, ảnh, clip, chữ và các lớp đồ họa. Video 60 giây × 30 fps cần 1.800 frame.
3. Ghép voice/nhạc và mã hóa H.264 + AAC, `x264Preset: veryfast`, `crf: 20`, `yuv420p`.
4. ffprobe kiểm tra; tạo thêm SRT, JPG và metadata bài đăng.

Hiện `concurrency: 2` là hai luồng dựng frame song song, **không phải hai video đồng thời hoặc giới hạn tổng CPU ở hai lõi**. Chromium/FFmpeg có thể dùng thêm luồng. [worker.ts](../src/worker.ts) cùng [store.ts](../src/lib/store.ts) chỉ cho một job chạy trên kho dữ liệu; voice và render dùng chung hàng đợi. Thêm tiến trình worker hoặc mua thêm lõi chưa tự biến hệ thống thành render nhiều video cùng lúc.

Tăng concurrency có thể nhanh hơn hoặc chậm hơn tùy tải; phải benchmark thay vì đặt bằng toàn bộ số lõi. Đây cũng là hướng dẫn của [Remotion Performance Tips](https://www.remotion.dev/docs/performance).

## Cấu hình đề xuất theo mức sử dụng

Giả định output 1080×1920/30 fps, dài 30–180 giây, template bản tin thông thường. Bảng không quy đổi thành số video/ngày khi chưa biết độ phức tạp và thời gian chờ mong muốn.

| Mức | CPU | RAM | Ổ lưu trữ | Cách dùng |
| --- | --- | --- | --- | --- |
| Thử nghiệm, ít job | 4 vCPU hiện đại | 8 GB | SSD 100 GB | Một job, đo với concurrency 1–2; chấp nhận chờ |
| Cá nhân/nhóm nhỏ, dùng thường xuyên | 8 vCPU có hiệu năng ổn định | 16 GB | NVMe 200 GB | Cấu hình nên bắt đầu; hiện vẫn một job mỗi lần |
| Tải cao hơn, dự kiến mở rộng | 16 vCPU | 32 GB | NVMe 300–500 GB hoặc tách kho media | Đo trước khi nâng; muốn nhiều job đồng thời phải sửa queue/worker và kiểm tra RAM tổng |

vCPU không tương đương lõi vật lý và không cho biết tốc độ giữa các nhà cung cấp. Ưu tiên gói có tài nguyên CPU ổn định; hỏi rõ CPU chia sẻ, hạn mức tải kéo dài hoặc cơ chế credit. Đánh giá bằng thời gian render mẫu của chính dự án, không chỉ số GHz/lõi trên bảng giá.

Nếu nhiều người biên tập trong lúc render, cân nhắc tách máy web khỏi máy render sau khi có kiến trúc production. Bản hiện tại chưa triển khai mô hình nhiều máy này.

## GPU có cần không?

**Chưa cần GPU rời cho cấu hình khởi đầu này.** Mã hiện tại không bật `hardwareAcceleration`; bản Remotion 4.0.529 đang cài mặc định tùy chọn này là `disable`, nên chưa có pipeline mã hóa phần cứng được cấu hình/đo đạc.

GPU có thể hỗ trợ một số hiệu ứng và giải mã; chế độ headless và backend đồ họa ảnh hưởng việc GPU có thực sự được dùng. Có GPU không đồng nghĩa toàn bộ quá trình tự nhanh hơn. Nếu sau này có nhiều blur/shadow/WebGL hoặc muốn thử hardware encoding, cần benchmark riêng và kiểm tra chất lượng đầu ra. Tham khảo [Remotion GPU](https://www.remotion.dev/docs/gpu) và [renderMedia](https://www.remotion.dev/docs/renderer/render-media).

TTS qua Vbee/Azure là dịch vụ bên ngoài, không chạy mô hình sinh giọng trên server Cre-vid. Vì vậy phần này không đặt yêu cầu GPU cho server hiện tại.

## Tốc độ đã đo và giới hạn suy luận

[Báo cáo gốc](benchmarks/local-render.json):

| Thuộc tính | Giá trị |
| --- | --- |
| Máy | Apple M4, 10 lõi, RAM 16 GiB, macOS ARM64 |
| Output | 60 giây, 1080×1920, 30 fps |
| Thiết lập | Template breaking, concurrency 2 |
| Thời gian | 100,3267 giây, khoảng 1,67 lần thời lượng video |
| Nội dung | 3 cảnh, nền vector, tiêu đề, watermark, phụ đề tiếng Việt |
| Chưa có trong fixture | Video upload, TTS; chưa đại diện hỗn hợp clip + voice + nhạc thực tế |

Đây là một phép đo trước các chỉnh sửa template gần đây; không đo lại trong lượt cập nhật tài liệu. Không suy ra VPS 8 vCPU sẽ bằng M4 hoặc video 3 phút chắc chắn mất 5 phút. Hiện chưa có median/p95, mức CPU%, RAM đỉnh, tốc độ theo từng template hoặc benchmark VPS.

Bản nháp dùng 1/3 kích thước mỗi chiều (dọc là 360×640), tức 1/9 số pixel đầu ra. Điều này không đồng nghĩa tổng thời gian nhanh gấp 9 vì còn giải mã, âm thanh và chi phí khởi tạo.

## Phần mềm và lưu trữ

- Node.js 22+; dùng lockfile với `npm ci`. Next.js/React, Remotion và các dependency theo `package-lock.json`.
- Chrome/Chromium tương thích; cấu hình `CHROME_PATH` nếu cần. Trên Linux phải cài thư viện hệ thống cho browser theo [hướng dẫn Remotion](https://www.remotion.dev/docs/miscellaneous/linux-dependencies). Hiện mới nghiệm chứng macOS; Linux cần chạy thử trước triển khai.
- FFmpeg/ffprobe được cài qua npm; kiểm tra binary đúng kiến trúc máy. Nếu dùng binary riêng, cấu hình `FFMPEG_PATH` và `FFPROBE_PATH`.
- Render là tiến trình dài; cần VPS/VM hoặc container cho phép chạy Chrome và worker nền. Chạy bản build (`npm run build`, `npm start`) thay dev server khi vận hành.
- Dữ liệu nằm tại `CREVID_DATA_DIR`, mặc định `.data/`; cần ổ bền vững và backup. Chưa có S3, tự dọn phiên bản render cũ hoặc chính sách lưu trữ tự động.
- Dung lượng cần tính cả bản gốc, file chuẩn hóa, nhiều lần render và file tạm. 50 file × 100 MB đã gần 5 GB đầu vào mỗi dự án, chưa tính bản chuẩn hóa có thể lớn hơn. Dự trù tối thiểu khoảng 30–50 GB trống trong giai đoạn thử, điều chỉnh theo media và đo thực tế.
- Kết nối Internet dùng khi nhập bài/ảnh, gọi TTS hoặc tải browser; file media đã nhập được lưu local. Render không gọi lại TTS mỗi lần.

Ứng dụng hiện bind `127.0.0.1`, chưa có xác thực/phân quyền. Thuê đúng cấu hình máy chỉ giải quyết tài nguyên; trước khi mở Internet cần bổ sung lớp truy cập được bảo vệ, HTTPS và nghiệm thu triển khai. Đây là phần còn lại của kế hoạch, chưa được thực hiện trong lượt này.

## Cách chốt cấu hình trước khi thuê dài hạn

1. Thuê thử cấu hình 8 vCPU/16 GB, hoặc 4 vCPU/8 GB nếu ưu tiên tiết kiệm và ít job.
2. Dùng ba fixture 60 giây: ảnh + chữ; ảnh + clip + voice + nhạc; template nhiều lớp. Thêm fixture 180 giây để thử giới hạn dài.
3. Mỗi fixture chạy ít nhất ba lần; ghi riêng lần khởi tạo lạnh và lần dùng lại bundle. Đo tổng thời gian job, RAM đỉnh, CPU, I/O, lỗi và dung lượng output. Đo thời gian chờ queue riêng.
4. Bắt đầu concurrency 2 hiện có, thử 1/2/4 có kiểm soát. Concurrency đang viết cố định trong mã, chưa có biến môi trường tùy chỉnh; việc bổ sung/tối ưu chưa được làm ở đây.
5. Chỉ tăng lõi/RAM khi số đo chỉ ra thiếu tài nguyên; chỉ nâng concurrency khi máy còn dư tải và kết quả tốt hơn. Không thêm nhiều worker chung `.data/` để tìm cách chạy song song.
6. Chọn cấu hình đáp ứng thời gian chờ và số video thực tế. Mục tiêu cũ “mẫu 60 giây trong 5 phút” là tiêu chí thử nghiệm, chưa phải SLA VPS.
