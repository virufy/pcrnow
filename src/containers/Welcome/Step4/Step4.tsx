import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import usePortal from 'react-useportal';
import { isMobile } from 'react-device-detect';

// Form
import { useForm, Controller } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';
import { yupResolver } from '@hookform/resolvers';
import { ErrorMessage } from '@hookform/error-message';
import * as Yup from 'yup';

// Components
import WizardButtons from 'components/WizardButtons';
import Link from 'components/Link';
import Checkbox from 'components/Checkbox';
import { BlackText } from 'components/Texts';

// Update Action
import { updateAction } from 'utils/wizard';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Hooks
import useEmbeddedFile from 'hooks/useEmbeddedFile';

// Utils
import { buildConsentFilePath } from 'helper/consentPathHelper';
import { scrollToTop } from 'helper/scrollHelper';
import { currentCountry } from 'utils/currentCountry';

// Data
import { consentPdf } from 'data/consentPdf';

// Styles
import {
  ContainerShapeDown,
  InnerContainerShapeDown,
  WelcomeContent,
  WelcomeStyledFormAlternative,
  WelcomeConsentForm,
  CheckboxTitle,
} from '../style';

const schema = Yup.object().shape({
  agreedConsentTerms: Yup.boolean().required().default(false).oneOf([true]),
  agreedPolicyTerms: Yup.boolean().required().default(false).oneOf([true]),
  agreedCovidCollection: Yup.boolean().required().default(false).oneOf([true]),
});

type Step3Type = Yup.InferType<typeof schema>;

const Step4 = (p: Wizard.StepProps) => {
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const [activeStep, setActiveStep] = React.useState(true);
  const { setType, setDoGoBack, setSubtitle } = useHeaderContext();

  const { state, action } = useStateMachine(updateAction(p.storeKey));

  const store = state?.[p.storeKey];

  const {
    control, handleSubmit, formState,
  } = useForm({
    defaultValues: store,
    resolver: yupResolver(schema),
    context: {
      country: currentCountry,
    },
    mode: 'onChange',
  });
  const { errors, isValid } = formState;
  const history = useHistory();
  const { isLoadingFile, file: consentFormContent } = useEmbeddedFile(
    buildConsentFilePath(currentCountry, state.welcome.language),
  );

  const onSubmit = async (values: Step3Type) => {
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

  const { t } = useTranslation();

  useEffect(() => {
    scrollToTop();
    setDoGoBack(() => doBack);
    setType('secondary');
    setSubtitle(t('consent:title'));
  }, [doBack, setDoGoBack, setType, setSubtitle, t]);

  return (
    <WelcomeStyledFormAlternative>
      <ContainerShapeDown isMobile={isMobile}>
        <InnerContainerShapeDown>
          <BlackText>
            <Trans i18nKey="consent:paragraph1">
              Virufy cares about your privacy and is advised by licensed data privacy experts.
              The information and recordings you provide will only be used for the purposes described in our
              Privacy Policy and consent form.
              Please read the consent Form:
            </Trans>
          </BlackText>
        </InnerContainerShapeDown>
      </ContainerShapeDown>
      <WelcomeContent>
        <WelcomeConsentForm dangerouslySetInnerHTML={{ __html: isLoadingFile ? 'Loading...' : consentFormContent }} />

        <BlackText>
          <Trans i18nKey="consent:paragraph3">
            By checking the below boxes, you are granting your explicit, freely given, and informed consent to Virufy to
            collect, process, and share your information for the purposes indicated above and as provided in greater
            detail in our Privacy Policy. You can print
            a copy of this Consent Form for your personal records by
            accessing <Link to={consentPdf[currentCountry]} target="_blank">Consent Form</Link>
          </Trans>
        </BlackText>

        <CheckboxTitle>
          {t('consent:pleaseConfirm', 'Please confirm the following:')}
        </CheckboxTitle>

        <Controller
          control={control}
          name="agreedConsentTerms"
          defaultValue={false}
          render={({ onChange, value }) => (
            <Checkbox
              id="Step2-ConsentTerms"
              label={(
                <Trans i18nKey="consent:certify">
                  I certify that I am at least 18 years old and agree to the terms of this Consent Form.
                </Trans>
              )}
              name="agreedConsentTerms"
              onChange={e => onChange(e.target.checked)}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="agreedPolicyTerms"
          defaultValue={false}
          render={({ onChange, value }) => (
            <Checkbox
              id="Step2-PolicyTerms"
              label={(
                <Trans i18nKey="consent:agree">
                  I have read, understood, and agree to the terms of the Virufy Privacy Policy.
                </Trans>
              )}
              name="agreedPolicyTerms"
              onChange={e => onChange(e.target.checked)}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="agreedCovidCollection"
          defaultValue={false}
          render={({ onChange, value, name }) => (
            <Checkbox
              id="Step2-CollectionCovid"
              label={(
                <Trans i18nKey="consent:collectionColombia">
                  I hereby expressly consent to the collection, processing and transfer of my personal information,
                  biometric information, and health information.
                </Trans>
                )}
              name={name}
              onChange={e => onChange(e.target.checked)}
              value={value}
            />
          )}
        />

        <p><ErrorMessage errors={errors} name="name" /></p>
        {activeStep && (
          <Portal>
            <WizardButtons
              invert
              leftLabel={t('consent:nextButton')}
              leftHandler={handleSubmit(onSubmit)}
              leftDisabled={!isValid}
            />
          </Portal>
        )}
      </WelcomeContent>
    </WelcomeStyledFormAlternative>
  );
};

export default React.memo(Step4);
