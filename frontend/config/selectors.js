/**
 * @param {Object} state .
 * @return {Object}
 */
export const getConfigState = (state) => {
  if (!state.extensions['@shopgate-project/page-redirects/config']) {
    return {};
  }
  return state.extensions['@shopgate-project/page-redirects/config'];
};
