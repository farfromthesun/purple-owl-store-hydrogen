import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

export function WordSwitcher({wordSwitcherFlag = true}) {
  const [words, setWords] = useState(['Shop', 'Discover']);
  const [wordId, setWordId] = useState(0);
  const wordSwitcherContainerRef = useRef(null);
  const initialWordFlag = useRef(false);

  useEffect(() => {
    if (!wordSwitcherFlag) return;
    const initialWord =
      wordSwitcherContainerRef.current?.getAttribute('data-initial');

    initialWordFlag.current === false &&
      setWords((prevWords) => [initialWord, ...prevWords]);
    initialWordFlag.current = true;
  }, [wordSwitcherFlag]);

  useEffect(() => {
    if (!wordSwitcherFlag) return;

    const intervalId = setInterval(() => {
      wordId < words.length - 1 ? setWordId(wordId + 1) : setWordId(0);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [wordId, wordSwitcherFlag, words.length]);

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        <motion.span
          initial={{opacity: 0, x: 10, filter: 'blur(4px)'}}
          animate={{opacity: 1, x: 0, filter: 'blur(0px)'}}
          exit={{opacity: 0, x: -10, filter: 'blur(4px)'}}
          transition={{duration: 0.5, ease: 'easeOut'}}
          ref={wordSwitcherContainerRef}
          data-initial="Summer"
          key={wordId}
          className="inline-block"
          layout
        >
          {words[wordId]} - {wordId}
        </motion.span>
      </AnimatePresence>{' '}
      <motion.span layout>right now!</motion.span>
    </div>
  );
}
