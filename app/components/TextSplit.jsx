import {nanoid} from 'nanoid';
import {Fragment, useMemo} from 'react';

export function TextSplit({children, delay = 0, firstWordGradient = false}) {
  const finalDelay = delay + 600;

  const words = useMemo(
    () =>
      children.split(' ').map((word) => ({
        wordText: word,
        wordId: nanoid(),
      })),
    [children],
  );

  return words.map((word, wordIdx) => (
    <Fragment key={word.wordId}>
      <span
        className={`inline-block opacity-0 invisible animate-fade-slide-v-blur-in-extra-long
          ${
            firstWordGradient &&
            wordIdx === 0 &&
            'bg-[linear-gradient(135deg,_#d05fcc_25%,_#4d0050)] bg-clip-text text-transparent'
          }
        `}
        style={{animationDelay: wordIdx * 50 + finalDelay + 'ms'}}
      >
        {word.wordText}
      </span>{' '}
    </Fragment>
  ));
}
