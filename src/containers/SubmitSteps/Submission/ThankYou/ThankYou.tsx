import React, { useEffect, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStateMachine } from 'little-state-machine';

// Components
import StayInTouch from 'components/StayInTouch';
import SocialIcons from 'components/SocialIcons';
import CreatedBy from 'components/CreatedBy';

// Utils
import { resetStore } from 'utils/wizard';

// Helper
import { scrollToTop } from 'helper/scrollHelper';

// Hooks
import useHeaderContext from 'hooks/useHeaderContext';

import {
  BeforeSubmitText,
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
      <BeforeSubmitText>{t('thankyou:paragraph1_cough')}</BeforeSubmitText>

      <StayInTouch />

      <SocialIcons />

      <CreatedBy inline={false} mt="72px" />

    </ThankYouLayout>
  );
};

export default React.memo(ThankYou);
