import {Link} from '@remix-run/react';
import {createElement} from 'react';

export function Button({type = Link, url, children = 'Button', onClick}) {
  const className =
    'rounded-md bg-main-purple px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-main-purple-dark transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple cursor-pointer';
  return createElement(type, {to: url, className, onClick}, children);
}
