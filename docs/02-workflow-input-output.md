# 02 — Luồng Input/Output

## Nguyên tắc

Mỗi bước là một công đoạn có thể mở lại trong Studio. Output lưu thành artifact có phiên bản; Input tham chiếu đúng phiên bản nguồn. Người dùng xem, nghe, tải, sửa hoặc chạy lại từng bước.

Luồng chính: **Tư liệu + nguồn bài → kịch bản → giọng đọc → cảnh/timeline → duyệt → render → xuất bản**. Nhập tư liệu và biên tập kịch bản có thể diễn ra độc lập trước khi ghép cảnh.

## Hợp đồng từng công đoạn

| Bước | Input | Xử lý và thao tác | Output lưu lại | Điều kiện chuyển tiếp |
| --- | --- | --- | --- | --- |
| 1. Khởi tạo | Tên, brand kit, tỷ lệ, template | Tạo dự án và cấu hình | Project, bản tham chiếu brand/template | Có tên, tỷ lệ hợp lệ |
| 2. Tư liệu | Ảnh/video người dùng tải lên | Kiểm tra file, đọc metadata, tạo thumbnail/proxy | Asset gốc, checksum, metadata, proxy, trạng thái | File đọc được; lỗi hiển thị theo file |
| 3. Nguồn tin | URL báo hoặc nội dung dán/nhập | Trích tiêu đề/nội dung; lưu URL, tên báo, tác giả/ngày nếu có | SourceArticle và bản nội dung đã lấy | Người dùng xem kết quả, xác nhận phần dùng |
| 4. Kịch bản | Nội dung nguồn, tiêu đề, lời dẫn | Biên tập và chia đoạn intro/body/outro | ScriptRevision và ScriptSegment có ID ổn định | Không có đoạn bắt buộc bị trống; đã duyệt lời đọc |
| 5. Giọng đọc | Đoạn văn, voice, tốc độ, cách phát âm | Nghe thử; TTS riêng từng đoạn; đo audio thực | AudioAsset, thời lượng, timing nếu có | Audio nghe được, tương ứng bản kịch bản hiện tại |
| 6. Storyboard | Đoạn kịch bản, audio, ảnh/video | Gán tư liệu cho cảnh, chọn crop, sắp xếp | SceneList, mapping segment ↔ scene ↔ media | Mỗi cảnh có hình hoặc nền hợp lệ |
| 7. Studio | SceneList, template, brand, audio | Trim, thời lượng, chữ, lớp đồ họa, mix âm thanh | TimelineRevision, CaptionTrack, bản xem trước | Không thiếu media; không cắt mất lời đọc |
| 8. Kiểm duyệt | Timeline và preview | Kiểm tra nội dung, nguồn, hình/chữ/âm thanh | ReviewRecord gắn đúng revision | Phiên bản được duyệt, không còn lỗi chặn |
| 9. Render | Snapshot đã duyệt, export preset | Render nền; kiểm tra file đầu ra | MP4, thumbnail, SRT, manifest, RenderJob | Job thành công và file được xác minh |
| 10. Xuất bản | RenderArtifact, tiêu đề, mô tả, kênh | Tải bộ file hoặc gửi qua connector đã kết nối | Publication, trạng thái và URL bài đăng nếu có | Đích xác nhận xử lý; không coi upload là đã đăng |

## Cấu trúc artifact chung

Mỗi artifact có `id`, `projectId`, `kind`, `revision`, `inputRefs`, `storageKey`, `checksum`, `createdAt`, `createdBy`, `status`. Metadata theo loại chứa kích thước, duration, codec, giọng đọc hoặc cấu hình render. Artifact mới không ghi đè file nguồn.

Job xử lý có trạng thái `queued → running → succeeded | failed | canceled`. Trạng thái `stale` thuộc artifact khi Input đã thay đổi, không dùng thay trạng thái job. UI hiển thị tiến độ có đo được; nếu không có thì hiển thị tên công đoạn, tránh phần trăm giả.

## Chỉnh sửa và chạy lại

| Thay đổi | Phải tính lại | Được giữ nguyên |
| --- | --- | --- |
| Sửa lời đọc một đoạn | TTS đoạn đó, timing phụ đề/cảnh liên quan, duyệt và render mới | Tư liệu, các audio không đổi |
| Đổi giọng toàn bài | Các đoạn TTS, timing, duyệt và render | Kịch bản, file ảnh/video |
| Đổi ảnh/crop một cảnh | Preview, duyệt và render | Kịch bản, voice |
| Đổi brand/template | Bố cục, kiểm tra chữ, preview, duyệt và render | Nội dung và audio |
| Đổi tỷ lệ xuất | Bố cục theo tỷ lệ, crop, duyệt và render tương ứng | File nguồn, kịch bản, voice |
| Sửa mô tả bài đăng | Bản metadata xuất bản và xác nhận đăng | Video nếu hình/âm thanh không đổi |

Khi lời đọc dài hơn cảnh, mặc định đề xuất kéo dài cảnh và dời các cảnh tiếp sau. Với cảnh đã khóa thời lượng, yêu cầu người dùng chọn chỉnh lời đọc hoặc mở khóa. Không tự cắt âm thanh. Clip ngắn hơn voice có lựa chọn giữ khung cuối, lặp clip hoặc thêm tư liệu; UI phải chỉ rõ lựa chọn đang áp dụng.

Intro mặc định 3–6 giây chỉ là gợi ý sáng tác; thời lượng cuối cùng theo giọng đọc thực, không ép tóm tắt dài vào 6 giây.

## Lỗi và khả năng phục hồi

- URL không hỗ trợ, bị chặn hoặc thiếu nội dung: cho dán văn bản và ghi nguồn thủ công; không làm mất dữ liệu đã nhập.
- TTS timeout: giữ lời đọc, báo lỗi theo đoạn, retry có giới hạn; dùng cache theo nội dung + giọng + cấu hình + phiên bản provider khi phù hợp.
- Phụ đề không có word timing: dùng timing theo đoạn và cho chỉnh tay. Không gắn nhãn “đồng bộ từng từ” nếu chưa có dữ liệu.
- Worker bị ngắt: job có heartbeat, timeout và retry; chỉ công bố artifact sau khi ghi file thành công và kiểm tra.
- Sửa dự án trong lúc render: job cũ tiếp tục dùng snapshot đã chốt; kết quả ghi rõ revision cũ, không gán nhầm là bản mới nhất.
- Retry job nội bộ dùng khóa chống trùng. Khi đăng mạng xã hội mà kết quả không rõ, tra cứu trạng thái từ xa trước khi cho gửi lại để tránh đăng trùng.

## Ví dụ một bản tin 60 giây

Input: 4 ảnh, 2 clip, một bài nguồn và logo của người dùng. Kịch bản gồm intro tóm tắt, 3 đoạn nội dung, outro tùy chọn. TTS trả audio từng đoạn; Studio phân bổ cảnh theo duration thực; người biên tập điều chỉnh để đạt khoảng 60 giây. Output gồm video dọc, ảnh bìa, phụ đề và nội dung bài đăng. Đây là fixture giả lập để kiểm thử, không tái sử dụng tin trong ảnh tham khảo như một tin đã xác minh.
