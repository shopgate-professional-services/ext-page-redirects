import { redirects, appWillStart$, hex2bin } from '@shopgate/engage/core';
import { ITEM_PATTERN } from '@shopgate/engage/product';
import { CATEGORY_PATTERN } from '@shopgate/engage/category';
import { redirects as redirectsConfig } from '../config';

/**
 * @param {Function} subscribe subscribe
 */
export default (subscribe) => {
  if (redirectsConfig && redirectsConfig.length) {
    subscribe(appWillStart$, () => {
      const groupedByPattern = redirectsConfig.reduce((acc, config) => {
        if (!acc[config.pattern]) {
          acc[config.pattern] = [];
        }
        // eslint-disable-next-line no-param-reassign
        config.paramDecode = [ITEM_PATTERN, CATEGORY_PATTERN].includes(config.pattern);
        acc[config.pattern].push(config);
        return acc;
      }, {});

      Object.keys(groupedByPattern).forEach((redirectPattern) => {
        const groupedRedirects = groupedByPattern[redirectPattern];
        if (groupedRedirects.length === 1 && !groupedRedirects[0].ids) {
          // Simple all pattern matches
          return redirects.set(redirectPattern, groupedRedirects[0].redirect);
        }

        return redirects.set(redirectPattern, ({ action }) => {
          const { route } = action;
          const {
            params: routeParams,
            pathname,
          } = route;

          const matched = groupedRedirects.find((redirect) => {
            if (!redirect.ids || !redirect.ids.length) {
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
            return matched.redirect;
          }

          return pathname;
        });
      });
    });
  }
};
