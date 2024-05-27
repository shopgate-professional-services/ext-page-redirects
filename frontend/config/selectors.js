import { createSelector } from 'reselect';

/**
 * @param {Object} state .
 * @return {Object}
 */
export const getConfigState = (state) => {
  console.log('----state----', state);
  if (!state.extensions['@shopgate-project/page-redirects/config']) {
    return {};
  }
  return state.extensions['@shopgate-project/page-redirects/config'];
};

/**
 * @returns {Object}
 */
export const getConfig = createSelector(
  getConfigState,
  ({ config }) => config
);
