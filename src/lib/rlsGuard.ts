/**
 * Supabase KHÔNG báo lỗi khi RLS chặn một UPDATE/DELETE — câu lệnh chạy "thành
 * công" nhưng ảnh hưởng 0 dòng (RLS lọc âm thầm ở mệnh đề USING, không phải một
 * điều kiện gây lỗi như WITH CHECK ở INSERT). Nếu chỉ kiểm `error` như thói quen
 * cũ, người dùng bị chặn ghi bởi Tầng 3 (migration 0041) sẽ thấy panel đóng lại
 * như đã lưu thành công — trong khi dữ liệu không hề đổi. Đây là lỗi có thật đã
 * bắt được khi kiểm thử `phong-khkt` sửa `nhan_su` (không có quyền `sua`).
 *
 * Cách dùng: thêm `.select('id')` vào câu UPDATE/DELETE rồi gọi hàm này thay vì
 * `throwIf(error)`. INSERT không cần — vi phạm `WITH CHECK` của RLS khi thêm
 * mới đã tự trả về lỗi thật từ Postgres.
 */
export function throwIfKhongGhiDuoc<T>(result: {
  data: T[] | null;
  error: { message: string } | null;
}): T[] {
  if (result.error) throw new Error(result.error.message);
  if (!result.data || result.data.length === 0) {
    throw new Error(
      'Không lưu được: bạn không có quyền thao tác trên bản ghi này. Liên hệ Quản trị hệ thống nếu cần cấp thêm quyền.',
    );
  }
  return result.data;
}
