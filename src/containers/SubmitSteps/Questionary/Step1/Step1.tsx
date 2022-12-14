import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import usePortal from 'react-useportal';
import { useTranslation } from 'react-i18next';

// Update Action

// Components
import { TitleBlack } from 'components/Texts';
import WizardButtons from 'components/WizardButtons';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Styles
import {
  MainContainer,
  QuestionNote,
  WomanWithPhone,
} from '../style';

const Step1 = ({
  previousStep,
  nextStep,
  metadata,
}: Wizard.StepProps) => {
  // Hooks
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const {
    setDoGoBack, setTitle, setSubtitle, setType,
  } = useHeaderContext();
  const history = useHistory();
  const { t } = useTranslation();

  // States
  const [activeStep, setActiveStep] = React.useState(true);

  const handleDoBack = React.useCallback(() => {
    setActiveStep(false);
    if (previousStep) {
      history.push(previousStep);
    } else {
      history.goBack();
    }
  }, [history, previousStep]);

  useEffect(() => {
    scrollToTop();
    setTitle(`${t('questionary:headerQuestions')}`);
    setSubtitle('');
    setType('primary');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, setSubtitle, t, metadata]);

  // Handlers
  const onSubmit = async () => {
    if (nextStep) {
      setActiveStep(false);
      history.push(nextStep);
    }
  };

  return (
    <MainContainer>
      <TitleBlack>{t('questionary:title')}</TitleBlack>
      <QuestionNote>{t('questionary:note')}</QuestionNote>
      <WomanWithPhone />
      {activeStep && (
        <Portal>
          <WizardButtons
            leftLabel={t('questionary:nextButton')}
            leftHandler={onSubmit}
            invert
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step1);
