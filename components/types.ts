export type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  sizeLabel: string;
};

export type OutputFormat = "webp_webm" | "jpg_mp4";

export type FormatSelectorProps = {
  selectedFormat: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
  disabled: boolean;
};

export type QualitySliderProps = {
  quality: number;
  onQualityChange: (quality: number) => void;
  disabled: boolean;
};

export type ConversionProgress = {
  fileId: string;
  fileName: string;
  status: "pending" | "converting" | "completed" | "failed";
  error?: string;
  convertedBlob?: Blob;
  convertedFileName?: string;
};
