export const privacyPolicy = {
  Colombia: 'https://virufy.org/en/privacy_policy/',
  Global: 'https://virufy.org/en/privacy_policy/',
};

declare global {
  type PrivacyPolicyCountry = keyof typeof privacyPolicy;
}
