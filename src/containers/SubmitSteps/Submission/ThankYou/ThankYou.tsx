import React, { useEffect, useCallback, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useStateMachine } from 'little-state-machine';

// Components
import StayInTouch from 'components/StayInTouch';
import CreatedBy from 'components/CreatedBy';

// Utils
import { resetStore } from 'utils/wizard';

// Helper
import { scrollToTop } from 'helper/scrollHelper';

// Hooks
import useHeaderContext from 'hooks/useHeaderContext';

import {
  BeforeSubmitText,
  SubmissionIdBox,
  ThankYouLayout,
  ThankYouTitle,
} from './style';

interface ThankYouLocation {
  submissionId: string;
  patientId?: string;
}

const ThankYou = (p: Wizard.StepProps) => {
  const { t } = useTranslation();

  const [, setActiveStep] = useState(true);
  const { setDoGoBack, setTitle, setType } = useHeaderContext();
  const { action } = useStateMachine(resetStore());

  const history = useHistory();
  const location = useLocation<ThankYouLocation>();

  const submissionId = location.state?.submissionId;

  React.useEffect(() => {
    action({});
  }, [action]);

  const handleDoBack = useCallback(() => {
    if (p.previousStep) {
      setActiveStep(false);
      history.push(p.previousStep);
    } else {
      history.goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToTop();
    setTitle('');
    setType('tertiary');
    setDoGoBack(null);
  }, [handleDoBack, setDoGoBack, setTitle, setType]);

  return (
    <ThankYouLayout>
      <ThankYouTitle>{t('thankyou:title')}</ThankYouTitle>
      <BeforeSubmitText $centered><Trans i18nKey="thankyou:paragraph1" /></BeforeSubmitText>
      {submissionId && (
        <SubmissionIdBox>
          <Trans i18nKey="thankyou:paragraph2">
            Your unique submission ID:
            <br />
            <strong>{{ submissionId }}</strong>
          </Trans>
        </SubmissionIdBox>
      )}
      <BeforeSubmitText>
        <Trans i18nKey="thankyou:paragraph3">
          Make sure to safeguard this submission ID, as you will need it to request Virufy to delete your anonymized
          data in future.
          <br /><br />
          If you later develop symptoms such as cough, fever, or shortness of breath, please come
          back to resubmit your
          latest cough sounds.
        </Trans>
      </BeforeSubmitText>

      <StayInTouch />

      <CreatedBy inline={false} mt="32px" />

    </ThankYouLayout>
  );
};

export default React.memo(ThankYou);
