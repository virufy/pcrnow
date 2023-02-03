export const reportProblemForm = {
  ja: 'https://docs.google.com/forms/d/e/1FAIpQLSfXBWlusanI0ngx12rmUuobvEsosYP9QjyPsYFiG3gAxskBAg/viewform',
};

declare global {
  type ReportProblemLanguage = keyof typeof reportProblemForm;
}
