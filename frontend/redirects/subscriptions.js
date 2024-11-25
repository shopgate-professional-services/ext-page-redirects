import {
  redirects as redirectCollection, appWillStart$, hex2bin,
} from '@shopgate/engage/core';
import { ITEM_PATTERN } from '@shopgate/engage/product';
import { CATEGORY_PATTERN } from '@shopgate/engage/category';
import { redirects as redirectsFromConfig, configEndpoint } from '../config';
import { fetchConfig } from '../config/actions';

/**
 * Retrieves redirects registered by other extensions for a redirect of the page-redirects extension
 * @param {Object} originalRedirectHandlerParams Params of the original redirect handler invocation
 * @param {string} originalRedirect Target path of the original redirect
 * @returns {string} The final redirect
 */
const getRedirectForInitialRedirect = async (
  originalRedirectHandlerParams,
  originalRedirect
) => {
  // Try to determine a redirect for the initial redirect (string / function / promise)
  let { handler: redirect } = redirectCollection.getRedirectExtended(originalRedirect) ?? {};

  if (!redirect) {
    return originalRedirect;
  }

  if (typeof redirect === 'function' || redirect instanceof Promise) {
    try {
      // Retrieve the redirect by invoking the handler
      redirect = await redirect({
        ...originalRedirectHandlerParams,
        action: {
          ...originalRedirectHandlerParams.action,
          params: {
            ...originalRedirectHandlerParams.action.params,
            // Merge the initial redirect into the redirect handler payload.
            pathname: originalRedirect,
          },
        },
      });
    } catch (e) {
      console.error('ext-page-redirects', e);
    }
  }

  return redirect || undefined;
};

/**
 * @param {Function} subscribe subscribe
 */
export default (subscribe) => {
  subscribe(appWillStart$, async ({ dispatch }) => {
    if (!redirectsFromConfig && !configEndpoint) {
      return null;
    }

    let redirects;

    // Check for manually configured config
    if (redirectsFromConfig) {
      redirects = redirectsFromConfig;
    }

    /**
     * Check for externally configured config.
     * Overwrite manually configured config if both is configured.
     */
    if (configEndpoint) {
      const redirectsFromPipeline = await dispatch(fetchConfig());
      if (redirectsFromPipeline.config.length) {
        redirects = redirectsFromPipeline.config;
      }
    }

    if (!Array.isArray(redirects)) {
      console.warn('Endpoint response is malformed');
      return null;
    }

    const noPattern = redirects.some(asdf => !asdf.hasOwnProperty('pattern'));

    if (noPattern) {
      return null;
    }

    const groupedByPattern = redirects
      .reduce((acc, config) => {
        if (!acc[config.pattern]) {
          acc[config.pattern] = [];
        }

        acc[config.pattern].push({
          ...config,
          paramDecode: [ITEM_PATTERN, CATEGORY_PATTERN].includes(config.pattern),
        });
        return acc;
      }, {});

    Object.keys(groupedByPattern).forEach((redirectPattern) => {
      const groupedRedirects = groupedByPattern[redirectPattern];

      if (groupedRedirects.length === 1 && !groupedRedirects[0].ids) {
        // Simple all pattern matches
        return redirectCollection.set(redirectPattern, groupedRedirects[0].redirect);
      }

      return redirectCollection.set(redirectPattern, async (handlerParams) => {
        const { route } = handlerParams.action;
        const {
          params: routeParams,
          pathname,
        } = route;

        const matched = groupedRedirects.find((redirect) => {
          if (!Array.isArray(redirect.ids) || !redirect.ids.length) {
            // The first matched redirect without ids
            return true;
          }
          // Match ids against route params
          return Object.values(routeParams).some(param => redirect.ids.includes(
            redirect.paramDecode
              ? hex2bin(param)
              : param
          ));
        });

        if (matched) {
          if (matched.target) {
            // Mutate target for external redirect
            route.state.target = matched.target;
          }

          // Other extensions might have registered a redirect for one of the redirects from the
          // redirects config. When that's the case, we need to return this redirect instead of
          // the redirect from the match.
          return getRedirectForInitialRedirect(handlerParams, matched.redirect);
        }

        return pathname;
      });
    });

    return null;
  });
};
