import React, { useEffect } from 'react';
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
  pcrTestResult: Yup.string().when('$hasPcr', { is: true, then: Yup.string().required(), otherwise: Yup.string() }),
}).defined();

const schemaWithPatient = Yup.object({
  patientAntigenTestResult: Yup.string().oneOf(['positive', 'negative', '']).when('patientPcrTestResult', (value: string, schema: any) => (!value ? schema.required() : schema)),
  patientPcrTestResult: Yup.string().oneOf(['positive', 'negative', '']),
}).defined();

type Step1aType = Yup.InferType<typeof schemaWithoutPatient> | Yup.InferType<typeof schemaWithPatient>;

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
  const [hasPcrTest, setHasPcrTest] = React.useState(false);

  useEffect(() => {
    if (state) {
      const { testTaken } = state['submit-steps'] || {};

      setHasPcrTest(testTaken?.includes('pcr') ?? false);
    }
  }, [state]);

  // Form
  const {
    control, handleSubmit, formState, setValue,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[storeKey],
    context: {
      hasPcr: state['submit-steps']?.testTaken?.includes('pcr') ?? false,
    },
    resolver: yupResolver(schemaWithoutPatient),
  });
  const { errors, isValid } = formState;

  console.log(state.welcome?.pcrTestResult);

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

  useEffect(() => {
    const pcrResult = state.welcome?.pcrTestResult;
    if (pcrResult === 'true') {
      setValue('pcrTestResult', 'positive');
    }
    if (pcrResult === 'false') {
      setValue('pcrTestResult', 'negative');
    }
  }, [setValue, state.welcome?.pcrTestResult]);

  // Handlers
  const onSubmit = async (values: Step1aType) => {
    if (values) {
      const {
        pcrTestDate,
        pcrTestResult,
      } = (values as any);
      // if patient
      if (hasPcrTest && (!pcrTestDate || !pcrTestResult)) {
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
