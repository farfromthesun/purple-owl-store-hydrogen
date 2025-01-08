import {TextSplit} from './TextSplit';

export function PageHero({title, subtitle, pageType = 'page'}) {
  const titleToDisplay =
    pageType === 'collection'
      ? title
        ? `'${title}' Collection`
        : 'Collection'
      : title;

  return (
    <div
      data-dark="true"
      className="relative isolate overflow-hidden bg-main-purple-super-dark bg-[radial-gradient(_ellipse_120%_123%_at_center_91%,_#a737a5_-49%,_transparent_45%_)] px-6 sm:px-16 md:px-24 flex justify-center"
    >
      {/* <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
      >
        <circle
          r={512}
          cx={512}
          cy={512}
          fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
          fillOpacity="0.7"
        />
        <defs>
          <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
            <stop stopColor="#7775D6" />
            <stop offset={1} stopColor="#E935C1" />
          </radialGradient>
        </defs>
      </svg> */}
      <div className="max-w-md text-center py-24 md:py-28 lg:py-32">
        {titleToDisplay && (
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl text-balance">
            <TextSplit>{titleToDisplay}</TextSplit>
          </h1>
        )}
        {subtitle && (
          <p className="mt-6 text-lg leading-8 text-gray-300 text-balance">
            <TextSplit delay={400}>{subtitle}</TextSplit>
          </p>
        )}
      </div>
    </div>
  );
}
