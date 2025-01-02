import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {TextSplit} from './TextSplit';
import {FadeSlideBlurIn} from './FadeSlideBlurIn';

export function HomepageHero() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="pb-80 pt-10 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="relative mx-auto max-w-2xl lg:max-w-1400 px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              <TextSplit firstWordGradient>
                Summer styles are finally here
              </TextSplit>
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              <TextSplit delay={400}>
                This year, our new summer collection will shelter you from the
                harsh elements of a world that doesn't care if you live or die.
              </TextSplit>
            </p>
          </div>
          <div>
            <div className="mt-10">
              <div
                aria-hidden="true"
                className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full max-w-2xl lg:max-w-1400"
              >
                <div className="absolute transform sm:left-1/2 sm:top-0 sm:translate-x-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <FadeSlideBlurIn delay={1800}>
                      <div className="grid flex-shrink-0 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-01.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-02.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                      </div>
                    </FadeSlideBlurIn>
                    <FadeSlideBlurIn delay={2000}>
                      <div className="grid flex-shrink-0 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-03.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-04.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-05.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                      </div>
                    </FadeSlideBlurIn>
                    <FadeSlideBlurIn delay={2200}>
                      <div className="grid flex-shrink-0 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-06.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-lg">
                          <Image
                            alt="Homepage"
                            src="https://cdn.shopify.com/s/files/1/0724/6168/0949/files/home-page-hero-image-tile-07.jpg?v=1724402280"
                            className="h-full w-full object-cover object-center"
                            sizes="200px"
                          />
                        </div>
                      </div>
                    </FadeSlideBlurIn>
                  </div>
                </div>
              </div>
              <FadeSlideBlurIn delay={1200}>
                <Link
                  to="/collections/all-products"
                  className="button"
                  preventScrollReset
                >
                  Shop Collection
                </Link>
              </FadeSlideBlurIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
