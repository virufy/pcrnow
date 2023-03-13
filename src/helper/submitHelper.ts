import * as H from 'history';

// Hooks
import { client as axiosClient } from 'hooks/useAxios';

interface DoSubmitProps {
  setSubmitError(err: string | null): void;
  state: CommonJSON;
  captchaValue: string | null;
  action(payload: Object): void;
  nextStep?: string;
  setActiveStep(status: boolean): void;
  history: H.History;
}

export async function doSubmit({
  setSubmitError,
  state,
  captchaValue,
  action,
  nextStep,
  setActiveStep,
  history,
}: DoSubmitProps) {
  try {
    setSubmitError(null);
    const {
      agreedConsentTerms,
      agreedPolicyTerms,
      pcrTestResult,
    } = state.welcome;

    const {
      recordYourCough,
      recordYourBreath,
      recordYourSpeech,
      currentSymptoms,
      symptomsStartedDate,
      ageGroup,
      biologicalSex,
      vaccine,
      smokeLastSixMonths,
      currentMedicalCondition,
      pcrTestDate,
      pcrTestResult: pcrTestResultUserInput,
    } = state['submit-steps'];

    const body = new FormData();

    if (window.sourceCampaign) {
      body.append('source', window.sourceCampaign);
    }

    body.append('agreedConsentTerms', agreedConsentTerms);
    body.append('agreedPolicyTerms', agreedPolicyTerms);

    if (pcrTestResult) {
      body.append('pcrTestResult', pcrTestResult);
    }

    if (pcrTestResultUserInput) {
      body.append('pcrTestResultUserInput', pcrTestResultUserInput);
    }

    if (pcrTestDate) {
      body.append('pcrTestDate', pcrTestDate);
    }

    const coughFile = recordYourCough.recordingFile || recordYourCough.uploadedFile;
    body.append('cough', coughFile, coughFile.name || 'filename.wav');
    const breathFile = recordYourBreath.recordingFile || recordYourBreath.uploadedFile;
    body.append('breath', breathFile, breathFile.name || 'filename_breath.wav');
    const voiceFile = recordYourSpeech.recordingFile || recordYourSpeech.uploadedFile;
    body.append('voice', voiceFile, voiceFile.name || 'filename_voice.wav');

    if (currentSymptoms?.selected?.length > 0) {
      body.append('currentSymptoms', currentSymptoms.selected.join(','));
    }

    if (symptomsStartedDate) {
      body.append('symptomsStartedDate', symptomsStartedDate);
    }

    if (ageGroup) {
      body.append('ageGroup', ageGroup);
    }

    if (biologicalSex) {
      body.append('biologicalSex', biologicalSex);
    }

    if (vaccine) {
      body.append('vaccine', vaccine);
    }

    if (smokeLastSixMonths) {
      body.append('smokeLastSixMonths', smokeLastSixMonths);
    }

    if (currentMedicalCondition?.length > 0) {
      body.append('currentMedicalCondition', currentMedicalCondition.join(','));
    }

    if (currentMedicalCondition?.other) {
      body.append('otherMedicalConditions', currentMedicalCondition?.other);
    }

    if (currentSymptoms?.length > 0) {
      body.append('currentSymptoms', currentSymptoms.join(','));
    }

    if (currentSymptoms?.other) {
      body.append('otherSymptoms', currentSymptoms?.other);
    }

    if (captchaValue) {
      body.append('captchaValue', captchaValue);
    }

    const response = await axiosClient.post('savePcrnowInfo', body, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=savePcrnowInfo',
      },
    });

    action({});

    if (nextStep && response.data?.submissionId) {
      setActiveStep(false);
      history.push(nextStep, { submissionId: response.data?.submissionId });
    }
  } catch (error) {
    console.log(error);
    setSubmitError('beforeSubmit:submitError');
  }
}
