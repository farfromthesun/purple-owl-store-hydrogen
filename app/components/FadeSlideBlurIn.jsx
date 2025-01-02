export function FadeSlideBlurIn({children, delay = 0}) {
  const finalDelay = delay + 600;

  return (
    <div
      className="opacity-0 invisible animate-fade-slide-v-blur-in-extra-long"
      style={{animationDelay: finalDelay + 'ms'}}
    >
      {children}
    </div>
  );
}
