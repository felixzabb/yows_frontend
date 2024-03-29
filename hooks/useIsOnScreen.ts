import { useEffect, useState, useRef, RefObject } from 'react';

export default function useIsOnScreen(ref: RefObject<HTMLElement>) {

  const observerRef = useRef<IntersectionObserver | null>(null);
  const [ isOnScreen, setIsOnScreen ] = useState(false);

  // Return true if element intersects.
  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) =>
      setIsOnScreen(entry.isIntersecting)
    );
  }, []);

  useEffect(() => {
    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, [ref]);

  return isOnScreen;
};
