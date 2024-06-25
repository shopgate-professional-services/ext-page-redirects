import { PipelineRequest, shouldFetchData } from '@shopgate/engage/core';
import { requestConfig, receiveConfig, errorConfig } from './action-creators';
import { getConfigState } from './selectors';

/**
 * @returns {Promise<Object[]>}
 */
export const fetchConfig = () => (dispatch, getState) => {
  const stateConfig = getConfigState(getState());
  if (!shouldFetchData(stateConfig)) {
    return Promise.resolve(stateConfig);
  }

  dispatch(requestConfig());

  const request = new PipelineRequest('shopgate-project.page-redirects.getConfig').dispatch();

  request
    .then(({ config }) => dispatch(receiveConfig(config)))
    .catch(error => dispatch(errorConfig(error)));

  return request;
};
