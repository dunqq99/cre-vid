# TTS local — hai giọng cho Cre-vid

Triển khai ngày 03/10/2026. Dùng VieNeu-TTS v3 Turbo 3.8.3 qua ONNX/CPU, hiện dùng Hải Đăng (nam) và Trúc Ly (nữ), hai preset phong cách tự nhiên miền Bắc; tốc độ mặc định 1× theo phản hồi giọng nữ bị méo khi đọc nhanh. Cảm nhận độ tuổi cần người dùng nghe và duyệt. Vbee/Azure đã được bỏ khỏi giao diện và luồng tạo giọng mới; không có fallback cloud. Dự án và audio cũ vẫn đọc được.

## Cài và sử dụng

Cần Node theo README và Python 3.12–3.13. Chạy trong thư mục Cre-vid:

```sh
npm run tts:setup
npm run dev
```

Setup tạo `.venv-tts`, cài phiên bản trong `scripts/tts/requirements.lock.txt`, tải model/codec theo revision trong `scripts/tts/models.lock.json`, chọn đúng hai preset và tạo hai mẫu offline. Chỉ sau khi hai mẫu thành công mới ghi `.data/tts/manifest.json` đánh dấu sẵn sàng. Lần đầu cần Internet; model/codec khoảng 540 MiB, chưa tính môi trường Python. Không cần tài khoản hoặc token Hugging Face.

`CREVID_PYTHON` chọn Python dùng tạo virtualenv; `CREVID_TTS_PYTHON` chọn virtualenv riêng. `CREVID_DATA_DIR` đổi gốc lưu dữ liệu, mặc định `.data`. Dùng cùng cấu hình cho setup, web và worker. Cần tạo lại virtualenv khi chuyển máy.

Trong bước Voice: chọn Nam/Nữ → chỉnh tốc độ → Tạo giọng cho cảnh này → nghe audio. Nội dung dài được chia theo câu bên trong model. Tốc độ 0.5–1.5× được xử lý bởi FFmpeg giữ cao độ. Audio lưu vào media của dự án và được render như audio nhập thủ công.

## Chi tiết vận hành

- Worker quản lý một subprocess Python qua stdin/stdout UTF-8; không mở dịch vụ mạng.
- Runtime bật offline và chặn kết nối socket Python. Model, codec, tokenizer và tài nguyên phát âm đều ở local; không tải lén khi thiếu file.
- Cache Hugging Face dùng symlink nên setup materialize các file ONNX bằng hard link (copy nếu hệ thống không hỗ trợ), giữ trọng số ngoài graph trong cùng thư mục thật. Điều này đáp ứng kiểm tra đường dẫn của ONNX Runtime 1.30.
- Hủy hoặc timeout 10 phút sẽ dừng inference, dọn file tạm; tác vụ kế tiếp khởi động model lại. Model giải phóng sau 30 giây rảnh hoặc trước render.
- Tối đa 3.000 ký tự/cảnh; chỉ chấp nhận `male` hoặc `female`. WAV được kiểm tra và chuẩn hóa trước khi gắn. Audio sinh từ lời đọc đã thay đổi không tự gắn vào cảnh mới.
- Dependencies chỉ gồm inference với preset. SDK được cài bằng `--no-deps`; không cài Gradio, training, cloning hoặc các backend GPU. `pip check` có thể báo thiếu những dependency của các chức năng SDK không dùng; toàn bộ đường chạy Cre-vid được kiểm tra bằng sinh audio thật.
- Không commit virtualenv, model, manifest hay dữ liệu audio cá nhân. Giữ các license/notice trong cache khi phân phối lại model. [Điều khoản của tác giả](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo#-usage-rights--licensing-faq).

## Kiểm chứng thực tế trên máy macOS arm64 này

Python 3.12.14, SDK 3.8.3, ONNX Runtime 1.30.0; CPU với 4 thread inference. Các số sau là lượt thử ban đầu với cặp giọng tin tức Minh Đức/Mai Anh, trước khi chuyển sang Hải Đăng/Trúc Ly; không phải cam kết tốc độ.

| Giọng | Audio mẫu | Thời gian inference |
| --- | --- | --- |
| Minh Đức | 12,32 giây | 6,09 giây |
| Mai Anh | 11,28 giây | 2,59 giây |

Mẫu ở `.data/tts/samples/male.wav` và `female.wav`. Thời gian trên không gồm khởi tạo model; manifest sau mỗi lần setup ghi phép đo mới nhất. Cần người dùng nghe để duyệt chất lượng và sắc thái.

Đã chạy thêm runtime dưới `sandbox-exec` với `(deny network*)` của macOS: tạo WAV mới thành công, exit 0. Bài E2E thật tạo hai giọng từ nút trong Studio, xác nhận audio phát được và metadata từng cảnh, rồi render video 13,056 giây, H.264 360×640 + AAC. Đo audio video: mean -25 dB, max -7,2 dB (không im lặng).

```sh
npm test
npm run typecheck
npm run build
.venv-tts/bin/python -m unittest discover -s tests -p test_tts_runtime.py
# Khi npm run dev đang chạy và model đã cài (macOS/Linux):
CREVID_TTS_LIVE=1 npx playwright test tests/e2e/local-tts.spec.ts
# Windows CMD: set CREVID_TTS_LIVE=1, rồi chạy npx playwright test tests/e2e/local-tts.spec.ts
```

Kết quả cuối: 75 unit/integration test, 3 test Python, TypeScript và production build đều qua. Ba bài E2E TTS đã qua, gồm tạo audio thật và render. Lượt toàn bộ E2E trước đó: 18/19 qua; `tests/e2e/studio.spec.ts:281` không đạt điều kiện vị trí phụ đề so với title-panel trong bài `supports sports cinema and Shorts styles with fitted titles and saved settings`. Phần layout video không thay đổi trong triển khai TTS này. Chưa kiểm thử triển khai trên Windows/Linux.

## Điều chỉnh giọng và nhịp đọc

Theo yêu cầu tiếp theo, thay cặp tin tức bằng Hải Đăng/Trúc Ly, phong cách tự nhiên, và đặt tốc độ mặc định trong Studio là 1,2×. Vẫn chỉ có hai lựa chọn, không tải thêm model. Mẫu `hai-dang-1.2x.wav` dài 7,813 giây (bản 1×: 9,36 giây), `truc-ly-1.2x.wav` dài 7,678 giây (bản 1×: 9,20 giây), lưu tại `.data/tts/samples/`. FFmpeg atempo giữ cao độ. Người dùng nghe mẫu để duyệt cảm giác trẻ trung; không suy ra tuổi từ metadata preset. Audio đã lưu ở các cảnh không bị thay đổi, cần tạo lại để áp dụng giọng/tốc độ mới.

Kiểm chứng sau điều chỉnh: 75 unit/integration test, 3 Python test và typecheck qua; E2E thật tạo hai giọng ở 1,2× và render MP4 qua. Đã sửa lỗi tác vụ voice hoàn tất trước lần poll đầu khiến audio không tự hiện: đăng ký trạng thái job ngay khi API trả về. Có bài E2E riêng cho trường hợp hoàn tất tức thì.

Phản hồi tiếp theo: giọng nữ bị méo ở tốc độ nhanh. Đã đưa tốc độ mặc định về 1×, giữ Hải Đăng/Trúc Ly. Ở 1× dùng WAV gốc của model, không chạy bộ lọc đổi tốc độ. Audio đã tạo ở 1,2× cần tạo lại để áp dụng; cảm nhận chất giọng vẫn cần nghe mẫu gốc.

### Đồng bộ phụ đề với audio — 04/10/2026

Phát hiện phụ đề phân bổ theo toàn bộ thời lượng cảnh (`max(thời lượng hình, audio)`), nên khi audio ngắn hơn cảnh, sub trễ dần. Trong dự án thực tế, cảnh 5 dài 17 giây nhưng audio chỉ 12,11 giây. `captions()` nay phân bổ theo thời lượng audio đã đo khi giọng khớp lời dẫn; phần hình dư không kéo giãn sub. Preview, MP4 và SRT dùng chung hàm này. Ở bản sửa đầu, cảnh sau vẫn bắt đầu theo timeline hình; yêu cầu tiếp theo bên dưới đã thay đổi hành vi này để bỏ thời gian dư.

Dự án/audio cũ áp dụng khi mở lại; MP4/SRT đã xuất cần xuất lại. Không cần tạo lại TTS. Khi chưa có audio hợp lệ, giữ cách ước lượng theo thời lượng cảnh. Mốc giữa các cụm chữ vẫn là ước lượng theo độ dài văn bản, chưa phải căn chỉnh từng từ theo tiếng nói (đặc biệt số, ngày tháng, tên nước ngoài và khoảng nghỉ).

Kiểm chứng: hai kiểm thử hồi quy tái hiện lỗi trước sửa và qua sau sửa; 77 kiểm thử qua, gồm render MP4 thật; E2E xác nhận preview hết sub khi audio kết thúc, cảnh sau giữ đúng mốc và SRT khớp. Typecheck qua.

### Tự khớp thời lượng cảnh theo giọng đọc — 04/10/2026

Theo yêu cầu nối cảnh liền mạch, cảnh có audio hợp lệ và khớp lời dẫn lấy thời lượng audio làm chuẩn, tự rút ngắn hoặc kéo dài ngay khi gắn TTS. Áp dụng cả audio sẵn có và audio nhập vào. `sceneFrames()` làm tròn lên khung hình ở 30 fps để không cắt âm cuối, phần đệm do làm tròn nhỏ hơn 1/30 giây. Timeline, preview, render và mốc SRT cùng dùng thời lượng mới. Không xử lý lại nội dung WAV hay xóa khoảng nghỉ bên trong audio.

Ô thời lượng hiển thị số giây của audio và khóa sửa khi giọng hợp lệ. Thời lượng nhập tay cũ được giữ làm giá trị dự phòng khi gỡ giọng hoặc đổi lời dẫn; cảnh chưa có audio tiếp tục chỉnh tay. Không cần di trú dữ liệu hoặc tạo lại giọng. Video đã xuất cần xuất lại.

Kiểm chứng: 79 kiểm thử qua, bao gồm gắn TTS vào dự án đã lưu và mốc nối hai cảnh; E2E qua cho thời lượng trên giao diện, tải lại trang, chuyển cảnh và SRT; typecheck qua.
