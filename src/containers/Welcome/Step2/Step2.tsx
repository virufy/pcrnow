import React, { useEffect, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import usePortal from 'react-useportal';

// Form
import { useForm, Controller } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';
import { yupResolver } from '@hookform/resolvers';
import { ErrorMessage } from '@hookform/error-message';
import * as Yup from 'yup';

// Update Action
import { resetStore, updateAction } from 'utils/wizard';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Components
import WizardButtons from 'components/WizardButtons';
import { BlackText } from 'components/Texts';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Assets
import HeaderSplash from 'assets/images/baseLogoSplash.png';

// Icons
import { ReactComponent as ExclamationSVG } from 'assets/icons/exclamationCircle.svg';

// Styles
import {
  HeaderImageContainer,
  HeaderImage,
  LogoWhiteBG,
  CustomPurpleText,
  WelcomeContent,
  WelcomeBullets,
  BulletIndicator,
  WelcomeStyledFormAlternative,
  InstructionContainer,
  WelcomeInput,
  TextErrorContainer,
} from '../style';

const schema = Yup.object({
  patientId: Yup.string()
    .matches(/^\d{6,10}$/, { message: 'patientIdRequired', excludeEmptyString: true })
    .required('patientIdLength'),
}).defined();

type Step2Type = Yup.InferType<typeof schema>;

const Step2 = (p: Wizard.StepProps) => {
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const resetExecuted = React.useRef(true);

  const { state, actions } = useStateMachine({ update: updateAction(p.storeKey), reset: resetStore() });

  const store = state?.[p.storeKey];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeStep, setActiveStep] = useState(true);
  const {
    setType, setDoGoBack, setLogoSize, setSubtitle,
  } = useHeaderContext();

  const history = useHistory();

  const {
    control,
    formState,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: store,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const { errors, isValid } = formState;

  const onSubmit = async (values: Step2Type) => {
    if (values) {
      actions.update(values);
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
    if (resetExecuted.current) {
      resetExecuted.current = false;
      actions.reset({ welcome: {} });
      reset({ patientId: '' });
    }
  }, [actions.reset, actions, reset]);

  const { t } = useTranslation();

  return (
    <WelcomeStyledFormAlternative>
      <HeaderImageContainer>
        <HeaderImage
          src={HeaderSplash}
        />
        <LogoWhiteBG />
      </HeaderImageContainer>
      <CustomPurpleText mb={15}>
        {t('main:paragraph2', 'Covid-19 Cough Data Collection Study')}
      </CustomPurpleText>
      <WelcomeContent maxWidth={470} mt={0}>
        <BlackText>
          <Trans i18nKey="helpVirufy:introParagraph">
            <p>
              Welcome to our study! This should only take you about 5 minutes to complete.
              Before we begin, let’s discuss what we will cover:
            </p>
          </Trans>
        </BlackText>

        <InstructionContainer>
          <WelcomeBullets>
            <BulletIndicator>1</BulletIndicator>
          </WelcomeBullets>
          <BlackText>
            <Trans i18nKey="helpVirufy:bulletsIntro">
              <strong>Intro: </strong>About us and Safety Reminders
            </Trans>
          </BlackText>
        </InstructionContainer>

        <InstructionContainer>
          <WelcomeBullets>
            <BulletIndicator>2</BulletIndicator>
          </WelcomeBullets>
          <BlackText>
            <Trans i18nKey="helpVirufy:bulletCough">
              <strong>Cough Into Phone</strong>
            </Trans>
          </BlackText>
        </InstructionContainer>

        <InstructionContainer>
          <WelcomeBullets>
            <BulletIndicator>3</BulletIndicator>
          </WelcomeBullets>
          <BlackText>
            <Trans i18nKey="helpVirufy:bulletQuestions">
              <strong>Quick Health Questions</strong>
            </Trans>
          </BlackText>
        </InstructionContainer>
        <BlackText>
          <strong>
            {t('main:patientId', 'Enter patient ID:')}
          </strong>
        </BlackText>
        <Controller
          control={control}
          name="patientId"
          defaultValue=""
          render={({ onChange, value, name }) => (
            <>
              <WelcomeInput
                name={name}
                value={value}
                onChange={onChange}
                type="text"
                autoComplete="Off"
                placeholder={
                  t('main:enterPatientId', 'Enter patient ID:')
                }
                error={errors.patientId}
              />
              {errors.patientId && (
                <TextErrorContainer>
                  <ExclamationSVG />
                  <ErrorMessage
                    errors={errors}
                    name="patientId"
                    render={({ message }) => <p>{t(`main:${message}`)}</p>}
                  />
                </TextErrorContainer>
              )}
            </>
          )}
        />

        {activeStep && (
          <Portal>
            <WizardButtons
              invert
              leftDisabled={!isValid}
              leftLabel={t('helpVirufy:nextButton')}
              leftHandler={handleSubmit(onSubmit)}
            />
          </Portal>
        )}
      </WelcomeContent>
    </WelcomeStyledFormAlternative>
  );
};

export default React.memo(Step2);
