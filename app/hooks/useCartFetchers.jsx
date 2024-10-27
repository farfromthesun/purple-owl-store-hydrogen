import {useFetchers} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';

export function useCartFetchers(actionName) {
  const fetchers = useFetchers();
  const cartFetchers = [];

  // console.log('fetchers', fetchers);
  // console.log('cartFetchers', cartFetchers);

  for (const fetcher of fetchers) {
    if (fetcher.formData) {
      const formInputs = CartForm.getFormInput(fetcher.formData);
      // console.log('formInputs', formInputs);
      // console.log('actionName', actionName);
      if (
        formInputs.action === actionName &&
        fetcher.state === 'loading' &&
        fetcher.data?.errors?.length === 0
      ) {
        cartFetchers.push(fetcher);
      }
    }
  }
  return cartFetchers;
}
