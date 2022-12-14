export const reportProblemForm = {
  es: 'https://docs.google.com/forms/d/e/1FAIpQLSe2qR2U5lB31h7D3GeK-V3Q_uy9ZOAYQ1XiVJr5RzD3zWhNaA/viewform',
};

declare global {
  type ReportProblemLanguage = keyof typeof reportProblemForm;
}
