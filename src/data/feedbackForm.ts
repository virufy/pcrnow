export const feedbackForm = {
  ja: 'https://forms.gle/VgwrCWLcr9svjZg58',
};

declare global {
  type FeedbackLanguage = keyof typeof feedbackForm;
}
