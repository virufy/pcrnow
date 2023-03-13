import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import usePortal from 'react-useportal';
import { useTranslation } from 'react-i18next';

// Form
import { useForm, Controller } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';
import { yupResolver } from '@hookform/resolvers';
import { ErrorMessage } from '@hookform/error-message';
import * as Yup from 'yup';

// Update Action
import { updateAction } from 'utils/wizard';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Components
import OptionList from 'components/OptionList';
import DatePicker from 'components/DatePicker';
import WizardButtons from 'components/WizardButtons';
import ProgressIndicator from 'components/ProgressIndicator';

// Styles
import {
  QuestionText, MainContainer, QuestionAllApply, WomanWithPhone, Title,
} from '../style';

const schemaWithoutPatient = Yup.object({
  pcrTestDate: Yup.date().when('$hasPcr', { is: true, then: Yup.date().required(), otherwise: Yup.date() }),
  pcrTestResult: Yup.string().oneOf(['positive', 'negative', 'unsure']).required(),
}).defined();

type Step1aType = Yup.InferType<typeof schemaWithoutPatient>;

const Step1b = ({
  previousStep,
  nextStep,
  storeKey,
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
  const { t, i18n } = useTranslation();
  const { state, action } = useStateMachine(updateAction(storeKey));

  // States
  const [activeStep, setActiveStep] = React.useState(true);

  const pcrTestResultDefault = useMemo(() => {
    const pcrResult = state.welcome?.pcrTestResult;
    if (pcrResult === 'true') {
      return 'positive';
    }
    if (pcrResult === 'false') {
      return 'negative';
    }
    return undefined;
  }, [state.welcome?.pcrTestResult]);

  // Form
  const {
    control, handleSubmit, formState, setValue,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      pcrTestDate: new Date(),
      pcrTestResult: pcrTestResultDefault,
      ...state?.[storeKey],
    },
    context: {
      hasPcr: state['submit-steps']?.testTaken?.includes('pcr') ?? false,
    },
    resolver: yupResolver(schemaWithoutPatient),
  });
  const { errors, isValid } = formState;

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
    setTitle(t('main:questionnaire'));
    setType('primary');
    setSubtitle('');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, setSubtitle, t]);

  useEffect(() => {
    setValue('pcrTestDate', new Date());
  }, [setValue]);

  // Handlers
  const onSubmit = async (values: Step1aType) => {
    if (values) {
      const {
        pcrTestDate,
        pcrTestResult,
      } = (values as any);
      // if patient
      if (!pcrTestDate || !pcrTestResult) {
        return;
      }

      action(values);
      if (nextStep) {
        setActiveStep(false);
        history.push(nextStep);
      }
    }
  };

  // Memos
  const pcrOptions = React.useMemo(() => [
    {
      value: 'positive',
      label: t('questionary:resultPcrTest.options.positive'),
    },
    {
      value: 'negative',
      label: t('questionary:resultPcrTest.options.negative'),
    },
    {
      value: 'unsure',
      label: t('questionary:resultPcrTest.options.unsure'),
    },
  ], [t]);

  return (
    <MainContainer>
      <>
        <ProgressIndicator
          currentStep={metadata?.current}
          totalSteps={metadata?.total}
          progressBar
        />
        <Title>{t('questionary:title')}</Title>
        <WomanWithPhone />
        <QuestionText extraSpace first>{t('questionary:whenPcrTest')}
          <QuestionAllApply>{t('questionary:whenPcrTestCaption')}</QuestionAllApply>
        </QuestionText>
        <Controller
          control={control}
          name="pcrTestDate"
          defaultValue={undefined}
          render={({ onChange, value }) => (
            <DatePicker
              label="Date"
              value={value ? new Date(value) : new Date()}
              locale={i18n.language}
              onChange={onChange}
            />
          )}
        />

        <QuestionText extraSpace>
          {t('questionary:resultPcrTest.question')}
        </QuestionText>
        <Controller
          control={control}
          name="pcrTestResult"
          defaultValue={undefined}
          render={({ onChange, value }) => (
            <OptionList
              singleSelection
              value={{ selected: value ? [value] : [] }}
              onChange={v => onChange(v.selected[0])}
              items={pcrOptions}
            />
          )}
        />
      </>
      {/* Bottom Buttons */}
      <p><ErrorMessage errors={errors} name="name" /></p>
      {activeStep && (
        <Portal>
          <WizardButtons
            leftLabel={t('questionary:nextButton')}
            leftHandler={handleSubmit(onSubmit)}
            leftDisabled={!isValid}
            invert
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step1b);
