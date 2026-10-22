-- Cover the deleted_by foreign key in the permanent Trash table.
create index if not exists trash_items_deleted_by_idx
  on public.trash_items (deleted_by);
