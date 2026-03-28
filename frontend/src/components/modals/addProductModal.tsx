import React, { useEffect, useMemo, useRef, useState } from "react";

type Category = string;

export type AddProductPayload = {
  title: string;
  description?: string;
  category: Category;
  price: number;
  imageFile?: File | null;
};

type Props = {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: AddProductPayload) => void;
};

const AddProductModal: React.FC<Props> = ({ open, categories, onClose, onSubmit }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const btnCloseRef = useRef<HTMLButtonElement | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Category>(categories[0] || "");
  const [price, setPrice] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  // Reset form when open toggles from false -> true
  useEffect(() => {
    if (open) {
      setTitle("");
      setDesc("");
      setCategory(categories[0] || "");
      setPrice("");
      setImage(null);
    }
  }, [open, categories]);

  useEffect(() => {
    if (!open) return;
    if (!category && categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [open, categories, category]);

  // Close on ESC / click outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (!dialogRef.current) return;
      if (!dialogRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  const priceNumber = Number(price);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple validation
    if (!title.trim()) return alert("Product title is required");
    if (!category) return alert("Category is required");
    if (!price || isNaN(priceNumber) || priceNumber < 0) return alert("Enter a valid price");

    onSubmit({
      title: title.trim(),
      description: desc.trim() || undefined,
      category,
      price: priceNumber,
      imageFile: image,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/20 p-4 md:p-8 overflow-y-auto"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-product-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-card border border-card dark:border-gray-800 shadow-card"
      >
        {/* subtle glow like mock */}
        <div className="pointer-events-none absolute -inset-1 rounded-card blur-2xl bg-brand/10" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-5 py-3">
          <button
            ref={btnCloseRef}
            type="button"
            className="w-9 h-9 grid place-items-center rounded-lg border border-gray-200 text-slate-700 hover:bg-slate-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h3 id="add-product-title" className="text-lg font-semibold">
            Add New Product
          </h3>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 p-5">
          {/* Left column (md: span 3) */}
          <div className="md:col-span-3 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your product title"
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter the description"
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            {/* Image uploader (aligned with mock’s small pill input label) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Product Image
              </label>
              <div className="mt-1 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 cursor-pointer">
                  <i className="bi bi-upload" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                </label>
                {image ? (
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">{image.name}</span>
                ) : (
                  <span className="text-xs text-slate-400">No file chosen</span>
                )}
              </div>
            </div>
          </div>

          {/* Right column (md: span 2) */}
          <div className="md:col-span-2 space-y-4">
            {/* Preview card like mock */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <div className="text-sm font-medium mb-2">Product Image</div>
              <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-50 dark:bg-gray-800 grid place-items-center">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <i className="bi bi-image text-3xl text-slate-400" />
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-slate-500 dark:border-gray-800 dark:bg-gray-900">
                  $
                </span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="h-10 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:opacity-95"
              >
                Add Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;