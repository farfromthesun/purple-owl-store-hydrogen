import {SpinningCircleIcon} from './SpinningCircleIcon';

export function PaginatedLoadMoreButton({isLoading, direction, text}) {
  return (
    <div
      className={`button flex justify-center ${
        direction === 'prev' ? 'mb-6' : direction === 'next' ? 'mt-6' : ''
      }`}
    >
      {isLoading ? (
        <>
          <SpinningCircleIcon classes="-ml-1 mr-2 h-5 w-5 text-white" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <span>{text}</span>
        </>
      )}
    </div>
  );
}
