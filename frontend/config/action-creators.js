import {
  PAGE_REDIRECTS_REQUEST_CONFIG,
  PAGE_REDIRECTS_RECEIVE_CONFIG,
  PAGE_REDIRECTS_ERROR_CONFIG,
} from './constants';

/**
 * @return {Object}
 */
export const requestConfig = () => ({
  type: PAGE_REDIRECTS_REQUEST_CONFIG,
});

/**
 * @param {Object[]} config .
 * @return {Object}
 */
export const receiveConfig = config => ({
  type: PAGE_REDIRECTS_RECEIVE_CONFIG,
  config,
});

/**
 * @param {Error} error .
 * @return {Object}
 */
export const errorConfig = error => ({
  type: PAGE_REDIRECTS_ERROR_CONFIG,
  error,
});
