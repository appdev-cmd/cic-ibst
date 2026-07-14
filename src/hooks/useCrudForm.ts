import { useState, type FormEvent } from 'react';

/**
 * Trạng thái modal thêm/sửa/xóa dùng chung cho các trang CRUD
 * (theo mẫu đã chạy ổn ở DonViPage/NhanSuPage).
 */
export function useCrudForm<TRow, TInput>(opts: {
  empty: TInput;
  toForm: (row: TRow) => TInput;
  getId: (row: TRow) => string;
  create: (input: TInput) => Promise<void>;
  update: (id: string, input: TInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  deleteMessage: (row: TRow) => string;
  onDone: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [form, setForm] = useState<TInput>(opts.empty);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(opts.empty);
    setActionError(null);
    setModalOpen(true);
  };

  const openEdit = (row: TRow) => {
    setEditing(row);
    setForm(opts.toForm(row));
    setActionError(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      if (editing) await opts.update(opts.getId(editing), form);
      else await opts.create(form);
      setModalOpen(false);
      opts.onDone();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (row: TRow) => {
    if (!window.confirm(opts.deleteMessage(row))) return;
    setActionError(null);
    try {
      await opts.remove(opts.getId(row));
      opts.onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(
        msg.includes('foreign key')
          ? 'Không thể xóa: bản ghi đang có dữ liệu khác tham chiếu.'
          : msg,
      );
    }
  };

  return {
    modalOpen,
    closeModal,
    editing,
    form,
    setForm,
    saving,
    actionError,
    openCreate,
    openEdit,
    submit,
    removeRow,
  };
}
