import { persistedReducers } from '@shopgate/engage/core';
import {
  PAGE_REDIRECTS_REQUEST_CONFIG,
  PAGE_REDIRECTS_RECEIVE_CONFIG,
  PAGE_REDIRECTS_ERROR_CONFIG,
} from './constants';
import { configTTL } from '../config';

persistedReducers.set('extensions.@shopgate-project/page-redirects/config');

/**
 * @param {Object} [state={}] The current state.
 * @param {Object} action The action object.
 * @return {Object} The new state.
 */
export default (state = {}, action) => {
  switch (action.type) {
    case PAGE_REDIRECTS_REQUEST_CONFIG:
      return {
        ...state,
        isFetching: true,
      };
    case PAGE_REDIRECTS_ERROR_CONFIG:
      return {
        ...state,
        isFetching: false,
      };
    case PAGE_REDIRECTS_RECEIVE_CONFIG:
      return {
        ...state,
        config: action.config,
        isFetching: false,
        expires: Date.now() + (configTTL * 1000),
      };
    default:
      return state;
  }
};
