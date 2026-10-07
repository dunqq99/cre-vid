# TTS local với hai giọng cố định

Ngày: 2026-10-03. Trạng thái: đã triển khai; xem [kết quả kiểm chứng](../../18-local-tts.md).

## Yêu cầu đã xác nhận

Người dùng chọn dùng mô hình có sẵn chạy local, cố định một giọng nam và một giọng nữ để đọc kịch bản Cre-vid. Không huấn luyện mô hình, không xây kho giọng hay tính năng mở rộng.

## Phương án

Dùng VieNeu-TTS v3 Turbo bản mã nguồn mở, backend ONNX/CPU, với hai preset giọng tiếng Việt. Một bộ trọng số dùng chung cho hai preset; hai giọng không đòi hỏi hai bản sao mô hình. Đây là mô hình bên ngoài được tải về chạy trên máy, không phải mô hình do Cre-vid tự huấn luyện và không gọi dịch vụ TTS bên ngoài.

SDK tham chiếu hiện công bố phiên bản 3.8.3. Khi cài đặt cần khóa phiên bản SDK, dependencies và revision các model thực tế đã kiểm tra. Không dùng phiên bản v4 chỉ cung cấp qua dịch vụ.

Hai lựa chọn từng cân nhắc:

- Mô hình dùng chung và hai preset: phù hợp yêu cầu đã xác nhận, giảm lưu trữ và vận hành; phương án được đề xuất.
- Hai mô hình riêng hoặc fine-tune: tăng công cài đặt, dữ liệu và kiểm thử, không cần thiết cho phạm vi này.

## Lưu trữ và vận hành

- Môi trường Python riêng trong `.venv-tts/`; model và các tài nguyên đi kèm trong `.data/tts/`. Không commit các thư mục này.
- Bước setup tải model, tokenizer, codec và tài nguyên phát âm cần thiết một lần. Runtime bật chế độ offline, không tự tải hoặc gọi dịch vụ cloud khi thiếu file.
- Hai ID công khai duy nhất là `male` và `female`. Setup dùng danh sách preset chính thức, xác minh nhãn giới tính và tạo hai audio mẫu để nghe kiểm tra. Lưu ánh xạ preset được chọn cùng revision vào manifest local; các lần chạy sau giữ nguyên ánh xạ, không tự chọn lại theo thứ tự danh sách.
- Worker Node quản lý một tiến trình Python, giao tiếp JSON theo dòng qua stdin/stdout và ghi log ra stderr. Model được giữ trong bộ nhớ qua các tác vụ; không mở cổng mạng mới.
- Chạy một tác vụ voice/render tại một thời điểm theo hàng đợi hiện có. Hủy tác vụ hoặc hết thời gian sẽ dừng tiến trình inference và dọn file tạm; tác vụ sau khởi tạo lại nếu cần.
- Chỉ tải model khi cần tạo voice. Đặt giới hạn chờ và giải phóng tiến trình/model khi rảnh trước tác vụ render để tránh giữ RAM không cần thiết.

## Tích hợp Cre-vid

Luồng: lời đọc của cảnh → job voice → adapter local → Python/model → WAV → chuẩn hóa media → gắn audio vào cảnh.

- Bước Voice mặc định dùng TTS local, chỉ hiển thị Nam/Nữ, tốc độ và nút tạo giọng. Bỏ chọn nhà cung cấp cloud khỏi luồng tạo giọng mới.
- API kiểm tra hai ID giọng, lời đọc và tốc độ trước khi enqueue. Model chưa sẵn sàng thì báo hướng dẫn setup cụ thể.
- Giữ định dạng dự án cũ và audio đã lưu để mở lại được. Không tự chuyển job local thất bại sang Vbee/Azure.
- Giữ nhập MP3/WAV, nghe thử, tự tăng thời lượng cảnh theo audio và đánh dấu audio cũ khi đổi lời đọc.
- Đầu ra local phải đi vào `ingestMedia` với đuôi WAV đúng định dạng, thay vì đường dẫn MP3 đang dùng cho TTS cloud.
- Chia lời đọc dài theo câu bên trong tác vụ TTS và ghép audio; không tự tạo thêm cảnh. Tốc độ dùng xử lý audio giữ cao độ nếu backend không hỗ trợ tương đương.
- Trạng thái phân biệt chưa cài, thiếu model, sẵn sàng và lỗi; không coi chỉ có thư mục model là đã sẵn sàng.

Các vùng sửa chính: `src/lib/integrations.ts`, adapter local mới, `src/lib/model.ts`, API actions/status, `src/worker.ts`, `src/components/Studio.tsx`, scripts Python/setup, tài liệu cài đặt và kiểm thử.

## Xử lý lỗi

Thiếu Python/dependency/model, voice ID không hợp lệ, tiến trình bị lỗi, timeout và audio rỗng phải trả lỗi rõ ràng cho job. Chỉ gắn audio sau khi FFprobe/FFmpeg đọc và chuẩn hóa thành công. Không gắn kết quả vào cảnh đã đổi lời đọc trong lúc tạo voice; tận dụng kiểm tra snapshot hiện có.

## Điều kiện nghiệm thu

1. Setup trên máy hiện tại thành công, manifest ghi phiên bản model và đúng hai preset đã kiểm tra.
2. Tạo hai WAV thật từ cùng một đoạn tiếng Việt có dấu, số, ngày tháng và câu dài; kiểm tra thời lượng và cung cấp file để người dùng nghe xác nhận giọng.
3. Sau setup, chặn kết nối mạng của runtime và tạo được audio mới cho cả hai giọng.
4. Thử trong Studio: tạo voice, nghe audio, lưu/mở lại dự án và render một video ngắn có âm thanh.
5. Kiểm thử ID ngoài danh sách, model thiếu, tiến trình lỗi, hủy tác vụ và lời đọc thay đổi khi job đang chạy.
6. Chạy typecheck, unit test liên quan và build; ghi thời gian tạo audio, không lấy benchmark của tác giả làm kết quả trên máy này.

Chưa cam kết chất lượng giọng hay tốc độ trước khi chạy và nghe mẫu thực tế. Nếu backend không tương thích máy hiện tại, báo kết quả chẩn đoán trước khi thay sang mô hình khác.

## Nguồn kỹ thuật

- https://github.com/pnnbao97/VieNeu-TTS — bản open-source, backend CPU/ONNX, API preset và lưu WAV.
- https://github.com/pnnbao97/VieNeu-TTS/blob/main/pyproject.toml — SDK và dependencies hiện được công bố.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — quy ước Route Handlers của bản Next.js đang cài.
