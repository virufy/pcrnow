import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import usePortal from 'react-useportal';
import { useTranslation, Trans } from 'react-i18next';

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
import WizardButtons from 'components/WizardButtons';
import ProgressIndicator from 'components/ProgressIndicator';

// Styles
import {
  QuestionText, MainContainer, QuestionNote,
} from '../style';

const schema = Yup.object({
  currentSymptoms: Yup.object().required(),
}).defined();

type Step2Type = Yup.InferType<typeof schema>;

const Step2 = ({
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
    control, handleSubmit, formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[storeKey],
    resolver: yupResolver(schema),
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
    setTitle(`${t('questionary:headerQuestions')}`);
    setType('primary');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, metadata, t]);

  // Handlers
  const onSubmit = async (values: Step2Type) => {
    if (values) {
      action(values);
      if (nextStep) {
        setActiveStep(false);
        history.push(nextStep);
      }
    }
  };

  return (
    <MainContainer>
      <ProgressIndicator
        currentStep={metadata?.current}
        totalSteps={metadata?.total}
        progressBar
      />
      <QuestionText extraSpace first>
        <Trans i18nKey="questionary:symptoms.question">
          <strong>Which of the below symptoms do you currently have?</strong>
        </Trans>
        <QuestionNote>{t('questionary:allThatApply')}</QuestionNote>
      </QuestionText>
      <Controller
        control={control}
        name="currentSymptoms"
        defaultValue={{ selected: [], other: '' }}
        render={({ onChange, value }) => (
          <OptionList
            isCheckbox
            value={value}
            onChange={v => onChange(v)}
            items={[
              {
                value: 'none',
                label: t('questionary:symptoms.options.none'),
              },
              {
                value: 'bodyAches',
                label: t('questionary:symptoms.options.bodyAches'),
              },
              {
                value: 'dryCough',
                label: t('questionary:symptoms.options.dryCough'),
              },
              {
                value: 'wetCough',
                label: t('questionary:symptoms.options.wetCough'),
              },
              {
                value: 'feverChillsSweating',
                label: t('questionary:symptoms.options.feverChillsSweating'),
              },
              {
                value: 'headaches',
                label: t('questionary:symptoms.options.headaches'),
              },
              {
                value: 'lossTasteAndOrSmell',
                label: t('questionary:symptoms.options.lossTasteOrSmell'),
              },
              {
                value: 'newOrWorseCough',
                label: t('questionary:symptoms.options.worseCough'),
              },
              {
                value: 'runnyNose',
                label: t('questionary:symptoms.options.runnyNose'),
              },
              {
                value: 'breathShortness',
                label: t('questionary:symptoms.options.breathShortness'),
              },
              {
                value: 'soreThroat',
                label: t('questionary:symptoms.options.soreThroat'),
              },
              {
                value: 'chestTightness',
                label: t('questionary:symptoms.options.chestTightness'),
              },
              {
                value: 'vomitingAndDiarrhea',
                label: t('questionary:symptoms.options.vomitingAndDiarrhea'),
              },
              {
                value: 'weakness',
                label: t('questionary:symptoms.options.weakness'),
              },
              {
                value: 'other',
                label: t('questionary:symptoms.options.other'),
              },
            ]}
            excludableValues={['none']}
          />
        )}
      />
      {/* Bottom Buttons */}
      <p><ErrorMessage errors={errors} name="name" /></p>
      {activeStep && (
        <Portal>
          <WizardButtons
            leftLabel={t('questionary:nextButton')}
            leftDisabled={!isValid}
            leftHandler={handleSubmit(onSubmit)}
            invert
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step2);
