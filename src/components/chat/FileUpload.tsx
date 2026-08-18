import { useRef, useCallback } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import type { Attachment } from "../../types";
import { generateId } from "../../lib/utils";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const ALLOWED_TYPES = [
  ...IMAGE_TYPES,
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/javascript",
  "text/typescript",
  "text/html",
  "text/css",
  "application/xml",
  "text/x-python",
  "text/x-java",
];

function isImageType(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs max-w-[180px] group/chip">
      {isImageType(attachment.type) ? (
        <img src={attachment.dataUrl} alt={attachment.name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate text-[#D1D5DB] leading-tight">{attachment.name}</p>
        <p className="text-[10px] text-[#4B5563] leading-tight">{formatSize(attachment.size)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(attachment.id); }}
        className="p-0.5 rounded hover:bg-white/[0.06] text-[#4B5563] hover:text-[#D1D5DB] transition-colors flex-shrink-0 opacity-0 group-hover/chip:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface FileUploadButtonProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export function FileUploadButton({ attachments, onChange, disabled }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue;
      if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("text/")) continue;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      });
    }
    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments]);
    }
  }, [attachments, onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }, [processFiles]);

  return (
    <>
      <input ref={inputRef} type="file" multiple onChange={handleFileChange} accept={ALLOWED_TYPES.join(",")} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40"
        aria-label="Attach files"
      >
        <Paperclip className="w-4 h-4" />
      </button>
    </>
  );
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
      {attachments.map((att) => (
        <AttachmentChip key={att.id} attachment={att} onRemove={onRemove} />
      ))}
    </div>
  );
}
