import React, { useEffect, useCallback, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import usePortal from 'react-useportal';

// Form
import { useForm } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Components
import WizardButtons from 'components/WizardButtons';
import { BlackText } from 'components/Texts';

// Update Action
import { updateAction } from 'utils/wizard';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Assets
import HeaderSplash from 'assets/images/baseLogoSplash.png';
import AWSImage from 'assets/images/aws-logo.png';

// Styles
import {
  HeaderImageContainer,
  HeaderImage,
  LogoWhiteBG,
  WelcomeContent,
  WelcomeStyledFormAlternative,
  AWSLogo,
} from '../style';

const Step2 = (p: Wizard.StepProps) => {
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStep, setActiveStep] = useState(true);
  const {
    setType, setDoGoBack, setLogoSize, setSubtitle,
  } = useHeaderContext();
  const { state, action } = useStateMachine(updateAction(p.storeKey));

  // Form
  const {
    setValue, handleSubmit, register,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[p.storeKey],
  });

  const history = useHistory();
  const { search } = useLocation();

  const numParam = React.useMemo(() => {
    const params = search
      .replace('?', '')
      .split('&')
      .filter((item: string) => !item.includes('='))
      .find((item: string) => /[0-9]/.test(item));
    if (params) {
      return parseInt(params, 0);
    }
    return undefined;
  }, [search]);

  // Handlers
  const onSubmit = async (values: Wizard.StepProps) => {
    if (values) {
      action(values);
      if (p.nextStep) {
        setActiveStep(false);
        history.push(p.nextStep);
      }
    }
  };

  const doBack = useCallback(() => {
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
    setDoGoBack(() => doBack);
    setLogoSize('regular');
    setType('null');
  }, [doBack, setDoGoBack, setLogoSize, setType, setSubtitle]);

  useEffect(() => {
    if (numParam !== null && numParam !== undefined) {
      if (numParam % 2 === 0) {
        setValue('pcrTestResult', 'false');
      } else {
        setValue('pcrTestResult', 'true');
      }
    }
  }, [numParam, setValue]);

  const { t } = useTranslation();

  return (
    <WelcomeStyledFormAlternative>
      <HeaderImageContainer>
        <HeaderImage
          src={HeaderSplash}
        />
        <LogoWhiteBG />
      </HeaderImageContainer>
      <AWSLogo src={AWSImage} />
      <WelcomeContent maxWidth={470} mt={0}>
        <BlackText>
          <Trans i18nKey="helpVirufy:introParagraph">
            <p>
              Welcome to our research!
              This page will give you an overview of our research.
              *This will take approximately 5 minutes.
            </p>
          </Trans>
        </BlackText>

        <BlackText>
          <Trans i18nKey="helpVirufy:introParagraphJapanTitle">
            <strong>
              COVID-19 Request for Cough Data Collection
            </strong>
          </Trans>
        </BlackText>

        <BlackText>
          <Trans i18nKey="helpVirufy:introParagraphJapanDesc">
            <p>
              Purpose and positioning of the service
              <br />
              {/* eslint-disable-next-line max-len */}
              Virufy is a service that uses Artificial Intelligence (Al) to analyze voice patterns to determine if they are similar to the cough of a patient suffering from COVID-19. This service is not a medical device and provides information only and is not intended to provide medical advice, diagnosis, treatment, or prevention. The Service is not a substitute for a physician or other medical professional, and you should not make any medical decisions or take or discontinue any action (such as taking medication) based on the information provided. Also, do not use this service in life-threatening or emergency conditions. This service is not responsible for any disease you may be suffering from or the consequences of any action you take based on the information provided.
            </p>
          </Trans>
        </BlackText>

        <BlackText>
          <Trans i18nKey="helpVirufy:introParagraphJapanFooter">
            <strong>
              Purpose and positioning of the service <br />
              Terms of Use and Privacy Policy<br />
              Please use this service after agreeing to the following
            </strong>
          </Trans>
        </BlackText>

        <input type="hidden" {...register('pcrTestResult')} />

        {activeStep && (
          <Portal>
            <WizardButtons
              invert
              leftLabel={t('helpVirufy:agreeButton')}
              leftHandler={handleSubmit(onSubmit)}
            />
          </Portal>
        )}
      </WelcomeContent>
    </WelcomeStyledFormAlternative>
  );
};

export default React.memo(Step2);
