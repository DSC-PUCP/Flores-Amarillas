export type TemplateData = {
  personA: string;
  personB: string;
  startDate: string;
  message: string;
  image?: string;
  timelinePhotos?: string[];

  // 👉 NUEVO CAMPO:
  reasonsToLove?: string;
  couponText?: string;         // ✅ NUEVO
  couponImage?: string;        // ✅ NUEVO
};
