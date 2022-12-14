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
      patientId,
      agreedConsentTerms,
      agreedPolicyTerms,
      agreedCovidDetection,
      agreedCovidCollection,
      agreedTrainingArtificial,
      agreedBiometric,
    } = state.welcome;

    const {
      recordYourCough,
      currentSymptoms,
      symptomsStartedDate,

    } = state['submit-steps'];

    const body = new FormData();

    if (patientId) {
      body.append('patientId', patientId);
    }

    if (window.sourceCampaign) {
      body.append('source', window.sourceCampaign);
    }

    body.append('agreedConsentTerms', agreedConsentTerms);
    body.append('agreedPolicyTerms', agreedPolicyTerms);
    body.append('agreedCovidCollection', agreedCovidCollection);
    body.append('agreedCovidDetection', agreedCovidDetection);
    body.append('agreedTrainingArtificial', agreedTrainingArtificial);
    body.append('agreedBiometric', agreedBiometric);

    const coughFile = recordYourCough.recordingFile || recordYourCough.uploadedFile;
    body.append('cough', coughFile, coughFile.name || 'filename.wav');

    if (currentSymptoms?.selected?.length > 0) {
      body.append('currentSymptoms', currentSymptoms.selected.join(','));
    }

    if (symptomsStartedDate) {
      body.append('symptomsStartedDate', symptomsStartedDate);
    }

    if (currentSymptoms?.other) {
      body.append('otherSymptoms', currentSymptoms?.other);
    }

    if (captchaValue) {
      body.append('captchaValue', captchaValue);
    }

    const response = await axiosClient.post('saveCompensarInfo', body, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=saveCompensarInfo',
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
