import { useEffect, useState } from "react";

const useOnScreen = (threshold: number = 0.5) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: "0px",
        threshold,
      }
    );

    const element = document.querySelector(".section");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold]);

  return isVisible;
};

export default useOnScreen;
