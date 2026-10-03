# 03 — Studio và template

## Tham khảo hình ảnh

![Bố cục bản tin do người dùng cung cấp](references/news-style-reference.png)

Ảnh thể hiện tư liệu phủ nền, logo trên khối tiêu đề, bảng tin màu đỏ/hồng, chữ trắng đậm, watermark mờ và dải chữ vàng ở phần dưới. Kế hoạch khai thác cách phân tầng thông tin này bằng brand kit riêng của người dùng. Ảnh không chứng minh chuyển động, timing hoặc giọng đọc nên các yếu tố đó bên dưới là đề xuất.

Điểm cần cải thiện so với ảnh mẫu: tránh ngắt một từ sang dòng riêng, không để bảng chữ che vùng hình quan trọng, tách rõ tiêu đề bản tin và phụ đề lời đọc.

## Bố cục Studio

- Thanh đầu: tên dự án, trạng thái lưu, tỷ lệ, phiên bản, Xem trước, Render.
- Điều hướng công đoạn: Input → Kịch bản → Voice → Studio → Kiểm duyệt → Output.
- Cột trái: thư viện tư liệu, cảnh, template và lớp đồ họa.
- Trung tâm: khung preview có đường căn và vùng an toàn bật/tắt.
- Cột phải: thuộc tính đối tượng/cảnh đang chọn; các tab Input, Thiết lập, Output, Lịch sử.
- Phần dưới: timeline gồm các track hình, đồ họa, phụ đề, voice, tiếng gốc và nhạc nền.

MVP thao tác theo cảnh: kéo sắp xếp, trim đầu/cuối, kéo thời lượng, đổi crop và sửa thuộc tính. Không cần timeline tự do với mọi hiệu ứng để tạo bản tin đầu tiên.

## Các khối template

| Khối | Dữ liệu điền | Điều chỉnh | Đầu ra |
| --- | --- | --- | --- |
| Intro | Logo, tiêu đề, lời tóm tắt, hình nền, voice tóm tắt | Màu, vị trí, thời lượng theo voice, chuyển cảnh | Cảnh mở đầu |
| Body | Hình/video, voice đoạn, headline ngắn | Crop, trim, pan/zoom ảnh, layout | Cảnh nội dung |
| Lower-third | Tên người, địa điểm hoặc thông tin chính | Vị trí, thời điểm, thời lượng | Thanh chú thích |
| News sign | Nhãn Tin nóng/Cập nhật hoặc nhãn tự nhập | Màu, bật/tắt, vị trí | Nhãn đồ họa |
| Watermark | Logo/chữ thương hiệu | Độ mờ, kích thước, neo vị trí | Lớp nhận diện xuyên suốt |
| Source credit | Tên nguồn hoặc dòng ghi công | Nội dung và vùng đặt | Dòng nguồn có thể đọc được |
| Captions | Văn bản hiển thị và timing | Font, màu, nền, vị trí, xuống dòng | Phụ đề gắn video và/hoặc SRT |
| Outro | Logo, thông điệp kết thúc, CTA tùy chọn | Thời lượng, nhạc, bật/tắt | Cảnh kết thúc |
| Ticker — sau MVP | Nội dung chạy chữ | Tốc độ, hướng, vùng hiển thị | Dải tin chạy |

`spokenText` dùng cho TTS, `displayText` dùng cho tiêu đề/phụ đề; sửa cách đọc tên riêng không bắt buộc thay chữ hiển thị. Mỗi khối có thời điểm bắt đầu/kết thúc, thứ tự lớp, preset style và version.

## Ba bộ mẫu MVP

1. **Tin nóng dọc:** logo, intro tóm tắt, tư liệu toàn khung, bảng headline đỏ/hồng, watermark mờ, nhãn Tin nóng, phụ đề có nền. Lấy cảm hứng cấu trúc ảnh mẫu, thay bằng nhận diện của người dùng.
2. **Bản tin tiêu chuẩn dọc:** intro ngắn, hình/video trung tâm, lower-third gọn, phụ đề dưới, ghi nguồn và outro tùy chọn.
3. **Ảnh + lời dẫn dọc:** chuỗi ảnh với pan/zoom nhẹ, title card, voice theo đoạn, chuyển cảnh đơn giản và phụ đề.

Template là cấu hình có slot và quy tắc bố cục; người dùng điền nội dung mà không phải sửa mã. MVP có template do hệ thống cung cấp và lưu preset tùy chỉnh; trình thiết kế template hoàn toàn tự do thuộc giai đoạn sau.

## Brand kit

Lưu tên thương hiệu, logo sáng/tối, bảng màu, font hỗ trợ tiếng Việt, watermark, kiểu headline, lower-third, phụ đề và âm thanh intro tùy chọn. Khi áp dụng vào dự án, lưu version để chỉnh brand sau này không làm thay đổi âm thầm video cũ.

## Quy tắc hình, chữ và âm thanh

- Mỗi tỷ lệ có layout riêng; chuyển từ 9:16 sang 16:9 phải reflow chữ và kiểm tra crop.
- Safe-area là cấu hình theo preset, có thể điều chỉnh vì giao diện nền tảng thay đổi; không coi một bộ tọa độ là đúng vĩnh viễn.
- Không kéo méo ảnh; cho chọn contain, cover hoặc nền mờ. Crop thủ công có điểm lấy nét để giữ chủ thể.
- MVP phụ đề tối đa 2 dòng mỗi cue; không cắt dấu tiếng Việt hoặc ngắt giữa các ký tự của từ. Nếu quá dài, chia cue theo timing; headline quá dài phải sửa hoặc đổi layout.
- Cho xem cảnh báo tràn chữ, thiếu font, chữ ngoài khung, đồ họa chồng phụ đề. Lỗi tràn chữ hoặc thiếu font chặn render bản chính.
- Có mute tiếng gốc, gain riêng cho voice/nhạc, fade và hạ nhạc khi có lời đọc. Voice luôn được nghe thử trong bản mix cuối.
- Chuyển cảnh MVP dùng cut/fade; mặc định không chồng voice hai cảnh.
- Preview và render dùng cùng mô hình scene, font và phiên bản template. Kiểm tra hình đầu/giữa/cuối, ranh giới cảnh và phụ đề trên video thực.

## Output nhìn thấy trong Studio

Mỗi công đoạn hiển thị tên artifact, revision, thời điểm tạo, Input liên quan, trạng thái hiện hành/cần cập nhật và nút mở/tải/chạy lại. Render có danh sách phiên bản và preset. Xuất bản có thẻ riêng cho từng kênh; người dùng thấy rõ “đã tải lên”, “đang xử lý” và “đã xuất bản”.
