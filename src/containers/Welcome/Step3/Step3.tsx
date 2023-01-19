import React, { useEffect, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import usePortal from 'react-useportal';
import { isMobile } from 'react-device-detect';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Components
import WizardButtons from 'components/WizardButtons';
import { BlackText } from 'components/Texts';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Styles
import {
  ContainerShapeDown,
  InnerContainerShapeDown,
  WelcomeContent,
  WelcomeStyledFormAlternative,
  AboutUsSVG,
} from '../style';

const Step3 = (p: Wizard.StepProps) => {
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStep, setActiveStep] = useState(true);
  const {
    setType, setDoGoBack, setLogoSize, setSubtitle,
  } = useHeaderContext();

  const history = useHistory();

  const handleNext = React.useCallback(() => {
    if (p.nextStep) {
      history.push(p.nextStep);
    }
  }, [history, p.nextStep]);

  const doBack = useCallback(() => {
    if (p.previousStep) {
      setActiveStep(false);
      history.push(p.previousStep);
    } else {
      history.goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    scrollToTop();
    setDoGoBack(() => doBack);
    setLogoSize('regular');
    setSubtitle(t('helpVirufy:title'));
    setType('secondary');
  }, [doBack, setDoGoBack, setLogoSize, setType, setSubtitle, t]);

  return (
    <WelcomeStyledFormAlternative>
      <ContainerShapeDown isMobile={isMobile}>
        <InnerContainerShapeDown>
          <AboutUsSVG />
        </InnerContainerShapeDown>
      </ContainerShapeDown>
      <WelcomeContent maxWidth={470} mt={0}>
        <BlackText>
          <Trans i18nKey="helpVirufy:aboutParagraph">
            {/* eslint-disable-next-line max-len */}
            <p>Before we begin, regarding us and our research. <br /> We will give you a 5-minute explanation about us and our research.</p>
          </Trans>
        </BlackText>
        <BlackText $textLeft>
          <Trans i18nKey="main:note">
            {/* eslint-disable-next-line max-len */}
            <strong>Organization</strong> <br />Virufy, a nonprofit corporation developing an artificial intelligence (AI) application that can tell if the sounds of a cough are similar to those of a patient suffering from COVID-19, is conducting a clinical study (collecting sounds for AI training) to collect cough sounds for the Japanese rollout of this application.<br /><br />Virufy is a U.S. California nonprofit organization recognized as a tax-exempt public benefit corporation under Section 501(c)(3) of the U.S. Internal Revenue Code. We were founded in March 2020 as a project of the COVID-19 Innovation Response Lab at Stanford University and have been active worldwide, including Japan. With the help of leading researchers and experts from around the world and more than 50 organizations, including medical institutions, law firms, technology companies, university groups, and global NGOs, we have collected over 400,000 data samples of coughing voices and built our own machine learning We are developing AI applications based on algorithms.
          </Trans>
        </BlackText>
      </WelcomeContent>

      {activeStep && (
        <Portal>
          <WizardButtons
            invert
            leftLabel={t('helpVirufy:nextPageButton')}
            leftHandler={handleNext}
          />
        </Portal>
      )}

    </WelcomeStyledFormAlternative>
  );
};

export default React.memo(Step3);
