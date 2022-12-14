import React from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { createStore, setStorageType } from 'little-state-machine';

// Wizard
import Wizard from 'components/Wizard';

// Components
import DotIndicators from 'components/DotIndicators';
import {
  getWelcomeStepsWithoutDots, welcomeStepsDefinitions,
} from 'helper/stepsDefinitions';

setStorageType(window.localStorage);

const StoreKey = 'welcome';

createStore({
  [StoreKey]: {},
}, {
  name: 'compensar-app-wizard',
});

const stepsWithoutDots = getWelcomeStepsWithoutDots(StoreKey);
const currentSteps = welcomeStepsDefinitions(StoreKey);

const allSteps = [...stepsWithoutDots, ...currentSteps];

const Welcome = () => {
  // Hooks
  const location = useLocation();
  const match = useRouteMatch();

  const url = location.pathname.replace(match.url, '');

  const active = currentSteps.findIndex(step => step.path === url);

  return (
    <Wizard
      steps={allSteps}
    >
      {active >= 0 && (
        <DotIndicators
          current={active}
          total={currentSteps.length}
        />
      )}
    </Wizard>
  );
};

export default React.memo(Welcome);
