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

// Components
import WizardButtons from 'components/WizardButtons';
import ProgressIndicator from 'components/ProgressIndicator';
import OptionList from 'components/OptionList';
import Recaptcha from 'components/Recaptcha';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Utils
import { scrollToTop } from 'helper/scrollHelper';
import { doSubmit } from 'helper/submitHelper';
import { executeValidation } from 'helper/validationHelper';

// Styles
import {
  QuestionText, MainContainer, TempBeforeSubmitError,
} from '../style';

const stepSchema = Yup.object({
  symptomsStartedDate: Yup.string().when('currentSymptoms', {
    is: val => executeValidation(val), // val should be { selected: ... },
    then: (schema: any) => schema.required(), // o Yup.string().required(),
    otherwise: (schema: any) => schema, // o Yup.string()
  }),
}).defined();

type Step3Type = Yup.InferType<typeof stepSchema>;

const Step3 = ({
  previousStep,
  nextStep,
  storeKey,
  metadata,
}: Wizard.StepProps) => {
  // Hooks
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const { setDoGoBack, setTitle, setType } = useHeaderContext();
  const history = useHistory();
  const { t } = useTranslation();
  const { state, action } = useStateMachine(updateAction(storeKey));

  // States
  const [activeStep, setActiveStep] = React.useState(true);

  // Form
  const {
    control, handleSubmit, formState, watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[storeKey],
    resolver: yupResolver(stepSchema),
  });
  const { errors, isValid } = formState;
  const watchSymptoms = watch('currentSymptoms');

  /* Delete after Contact info step is re-integrated */
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = React.useState<string | null>(null);
  const [recaptchaAvailable, setRecaptchaAvailable] = React.useState(true);
  const { isSubmitting } = formState;

  useEffect(() => {
    if (!captchaValue) {
      setSubmitError(null);
    }
  }, [captchaValue]);

  const onSubmit = async (values: Step3Type) => {
    if (values) {
      await doSubmit({
        setSubmitError: s => setSubmitError(!s ? null : t(s)),
        state: {
          ...state,
          'submit-steps': {
            ...state['submit-steps'],
            ...values,
          },
        },
        captchaValue,
        action,
        nextStep,
        setActiveStep,
        history,
      });
    }
  };

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
    setTitle(t('questionary:headerQuestions'));
    setType('primary');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, t]);

  const covidSymptom = React.useMemo(() => executeValidation(watchSymptoms), [watchSymptoms]);

  return (
    <MainContainer>
      <ProgressIndicator
        currentStep={metadata?.current}
        totalSteps={metadata?.total}
        progressBar
      />
      {
        covidSymptom && (
          <>
            <QuestionText extraSpace first>
              {t('questionary:symptomsDate')}
            </QuestionText>
            <Controller
              control={control}
              name="symptomsStartedDate"
              defaultValue=""
              render={({ onChange, value }) => (
                <OptionList
                  singleSelection
                  value={{ selected: value ? [value] : [] }}
                  onChange={v => onChange(v.selected[0])}
                  items={[
                    {
                      value: 'today',
                      label: t('questionary:options.today'),
                    },
                    {
                      value: 'days',
                      label: t('questionary:options.days'),
                    },
                    {
                      value: 'week',
                      label: t('questionary:options.week'),
                    },
                    {
                      value: 'overWeek',
                      label: t('questionary:options.overWeek'),
                    },
                  ]}
                />
              )}
            />
          </>
        )
      }
      {/* Bottom Buttons */}
      <p><ErrorMessage errors={errors} name="name" /></p>
      {activeStep && (
        <Portal>
          { /* ReCaptcha  */}
          <Recaptcha onChange={setCaptchaValue} setRecaptchaAvailable={setRecaptchaAvailable} />
          {submitError && (
            <TempBeforeSubmitError>
              {submitError}
            </TempBeforeSubmitError>
          )}
          <WizardButtons
            invert
            leftLabel={isSubmitting ? t('questionary:submitting') : t('beforeSubmit:submitButton')}
            leftDisabled={(isSubmitting || (recaptchaAvailable && !captchaValue) || !isValid)}
            leftHandler={handleSubmit(onSubmit)}
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step3);
