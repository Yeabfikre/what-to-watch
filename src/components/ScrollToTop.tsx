import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Use instant so it doesn't jarringly scroll past content on new page paints
    });
  }, [pathname]);

  return null;
}
