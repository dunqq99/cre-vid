# 17 — Đăng Facebook Page và X

Cập nhật 02/10/2026. Phạm vi: ứng dụng cá nhân chạy local. Đã triển khai kết nối OAuth, chọn tài khoản, kiểm duyệt và hàng đợi xuất bản. Chưa kết nối tài khoản thật hoặc đăng bài thật trong phiên triển khai vì chưa có ứng dụng API/credentials của chủ dự án.

## Cách dùng

1. Render **bản chính** trong Output. File nháp không dùng để đăng trực tiếp.
2. Kéo xuống **Xuất bản**, chọn Facebook Page · Reels hoặc X.
3. Kết nối qua tab đăng nhập của nền tảng; cấp quyền cho đúng tài khoản/Page. Quay lại Studio, danh sách tự cập nhật sau khoảng 3 giây.
4. Chọn tài khoản và bản render. Xem video MP4 đã chọn, nhập caption. Khi dự án đã đổi, màn hình nhắc rằng file render vẫn thuộc phiên bản cũ.
5. Bấm **Xem lại bài đăng**, xác nhận tài khoản, video, nội dung và đăng công khai; sau đó bấm **Đăng ngay**.
6. Worker xử lý nền, cập nhật lịch sử và liên kết bài đăng. Hủy được khi còn chờ; đang gửi phải kiểm tra trên nền tảng.

Mỗi lần duyệt gửi một nền tảng/tài khoản. Muốn đăng cả hai, duyệt Facebook và X riêng. TikTok/YouTube vẫn tải MP4 và đăng thủ công. Chưa có lịch hẹn giờ, sửa/xóa bài từ Studio hay thống kê tương tác.

## Cấu hình local

Thêm vào `.env.local` (tham khảo `.env.example`), không dùng tiền tố `NEXT_PUBLIC_`:

```dotenv
SOCIAL_ORIGIN=http://127.0.0.1:3000
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_GRAPH_VERSION=
X_CLIENT_ID=
X_CLIENT_SECRET=
```

Không gửi token/secret qua chat hoặc đưa vào Git. Khởi động lại `npm run dev` sau khi cấu hình để cả Next và worker nhận biến mới.

`SOCIAL_ORIGIN` phải khớp địa chỉ dùng để mở Studio. Callback mặc định:

- Facebook: `http://127.0.0.1:3000/api/social/callback/facebook`
- X: `http://127.0.0.1:3000/api/social/callback/x`

Nếu cấu hình dùng `http://localhost:3000`, đổi SOCIAL_ORIGIN và cả callback đăng ký ở nhà cung cấp, rồi mở Studio bằng localhost. 127.0.0.1 và localhost không dùng chung cookie.

### Facebook Page

- Tạo/cấu hình ứng dụng trong [Meta for Developers](https://developers.facebook.com/apps/), bật luồng Facebook Login phù hợp, đăng ký callback chính xác. Điền App ID, App Secret.
- `FACEBOOK_GRAPH_VERSION`: điền phiên bản Graph API đang được ứng dụng của bạn hỗ trợ, dạng `vN.0` theo dashboard. Không tự chọn phiên bản mới nhất từ ví dụ cũ.
- Luồng xin `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`; lấy các Page có nhiệm vụ tạo nội dung/quản lý. Người đăng nhập cần có quyền trên Page và ứng dụng cần được Meta cấp các quyền tương ứng.
- Kiểm tra bằng tài khoản có vai trò trong ứng dụng ở chế độ phát triển. Phân phối cho người dùng khác có thể cần App Review/Advanced Access và các bước xác minh Meta yêu cầu trong dashboard.
- Luồng đăng: khởi tạo Reel → tải binary từ máy local → yêu cầu xuất bản → đọc trạng thái xử lý/xuất bản. Không cần public URL cho file video.

Tham khảo hợp đồng Reels từ [bộ API chính thức của Meta trên Postman](https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api?entity=request-23987686-0b79260c-96bd-49de-875b-6076213785fc) và [tài liệu Reels Publishing](https://developers.facebook.com/docs/video-api/guides/reels-publishing/).

### X

- Trong [X Developer Console](https://developer.x.com/), tạo ứng dụng OAuth 2.0 loại **Web App/confidential client**, cấp quyền đọc/ghi và khai báo callback chính xác.
- Điền **Client ID và Client Secret OAuth 2.0**; không dùng app-only Bearer Token thay cho chúng.
- Luồng xin `tweet.read tweet.write users.read media.write offline.access`, dùng PKCE S256 và refresh token. Token sắp hết hạn được làm mới trước khi đăng.
- Bật quyền/số dư API theo gói hiện có của tài khoản. Phí và hạn mức do X quyết định; Studio không bao gồm phí dịch vụ này.
- Video được chia phần 5 MiB, chờ xử lý media xong mới gửi bài. Endpoint v2: `/2/media/upload/initialize`, `/{id}/append`, `/{id}/finalize`, GET trạng thái và `/2/tweets`.

Nguồn: [OAuth 2.0 và scopes X](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code), [upload video theo phần](https://docs.x.com/x-api/media/quickstart/media-upload-chunked), [tạo bài đăng](https://docs.x.com/x-api/posts/create-post).

## Giới hạn bản tích hợp

| Nền tảng | Video | Caption |
| --- | --- | --- |
| Facebook Page Reels | Bản chính 9:16, H.264, ít nhất 540×960, 4–60 giây, tối đa 512 MiB | 1–5.000 ký tự |
| X | Bản chính H.264, tối đa 140 giây và 512 MiB | 1–280 ký tự; X kiểm tra thêm trọng số URL/emoji |

Đây là phạm vi bảo thủ được ứng dụng hỗ trợ, **không phải tuyên bố giới hạn tối đa của mọi loại tài khoản hoặc phiên bản API**. Các giới hạn FB dựa trên profile trong bộ Reels mẫu chính thức; khi muốn video dài hơn cần kiểm chứng phiên bản/tài khoản thật rồi mở rộng adapter. X có thể từ chối video theo quyền và loại tài khoản ngay cả khi upload đã thành công.

## Lưu trữ, lỗi và chống đăng trùng

- OAuth state ngẫu nhiên, một lần, hết hạn 10 phút; ràng buộc cookie HttpOnly/SameSite=Lax, nhà cung cấp và callback. Chỉ route callback cho phép điều hướng từ website khác; các API khác giữ chặn cross-origin và DNS rebinding.
- Access/refresh token lưu bằng AES-256-GCM trong `.data/social/vault`, khóa local `.data/social/key` quyền 0600. Không trả token về UI, không ghi response lỗi của nhà cung cấp vào nhật ký. Khóa nằm cùng máy: mã hóa này không bảo vệ khi kẻ khác đọc được toàn bộ tài khoản hệ điều hành/thư mục dữ liệu.
- Khi dùng CREVID_DATA_DIR, đường dẫn trên nằm dưới thư mục đó. Sao lưu cả vault và key bằng kho backup được bảo vệ; mất key phải kết nối lại. Không commit dữ liệu vận hành.
- Ngắt kết nối xóa thông tin xác thực local; không tự thu hồi ứng dụng bên nhà cung cấp. Muốn thu hồi toàn bộ, dùng phần Apps/Connected apps của Facebook/X. Không cho ngắt khi còn bài đang chờ/đang gửi.
- Bài đăng lưu riêng trong `.data/social-jobs`, gắn đúng project, render, revision và tài khoản. Render khác dự án, chưa hoàn tất hoặc bản nháp đều bị từ chối phía server.
- Một worker ưu tiên render/voice, sau đó nhận bài đăng. Hàng đợi tồn tại sau khởi động lại; bài chưa gửi tiếp tục chờ. Tác vụ đang chạy quá 60 giây không heartbeat được đánh dấu lỗi hoặc cần kiểm tra, không tự chạy lại.
- Persist trạng thái **submitted** trước request có thể làm bài công khai. Nếu mất mạng/crash sau thời điểm này: **Cần kiểm tra**, không tự retry. Facebook trả `success` cho yêu cầu finish chưa được coi là đã đăng; phải có `publishing_phase.status=complete`.
- Chặn đăng lại cùng bản render/tài khoản khi đang chờ, đang gửi, đã thành công hoặc cần kiểm tra, kể cả đổi caption. Bài lỗi trước bước gửi/hủy lúc chờ có thể duyệt lại. Nếu thực sự cần đăng lại bản đã gửi, kiểm tra nền tảng trước, tạo render mới rồi duyệt lại.

## Triển khai trên máy chủ

Bản hiện tại chỉ chấp nhận localhost. Nếu nền tảng/tài khoản không chấp nhận callback local và yêu cầu HTTPS, chưa thể nối bằng cách chỉ đổi SOCIAL_ORIGIN sang domain hoặc mở tunnel. Cần triển khai đăng nhập người dùng, phân quyền sở hữu dự án/tài khoản, CSRF/session cho các API, secret storage và queue production, sau đó HTTPS callback. Không bỏ guard của bản local để né bước này.

## Kiểm chứng

- Kết quả phiên triển khai: 68 unit/integration trên 14 file đạt (gồm 15 ca social); 2 E2E xuất bản mới đạt; TypeScript và production build đạt. Đã xem ảnh chụp giao diện duyệt bài.
- Kiểm thử adapter dùng HTTP giả lập, không dùng credential thật và không đăng bài thật.
- Bao phủ mã hóa/ẩn token, state sai/hết hạn/replay, PKCE/refresh, phân trang Page, chặn host/cross-origin, chunk upload X, chờ xử lý, không post khi media lỗi, preflight giới hạn, duyệt bắt buộc, file đúng dự án, chống submit trùng, hủy và khôi phục sau mất heartbeat.
- Kiểm thử trình duyệt local xác nhận màn cấu hình, chọn tài khoản/render, caption, xác nhận rõ ràng và lịch sử. Chỉ phần gửi bài trong trình duyệt được mock.
- Nghiệm thu còn lại: kết nối ứng dụng Meta/X thật với quyền đã cấp, đăng một video được chủ tài khoản duyệt, kiểm tra link/video/âm thanh/caption và tình huống hết quyền/hạn mức thực tế.
