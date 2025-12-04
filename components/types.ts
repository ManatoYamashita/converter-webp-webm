export type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  sizeLabel: string;
};

export type ImageFormat = "webp" | "jpg";

export type FormatSelectorProps = {
  selectedFormat: ImageFormat;
  onFormatChange: (format: ImageFormat) => void;
  disabled: boolean;
};

export type QualitySliderProps = {
  quality: number;
  onQualityChange: (quality: number) => void;
  disabled: boolean;
};
