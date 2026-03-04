import { MOTION_DURATION, MOTION_EASE, MOTION_OFFSET } from "./tokens";

export const pageTransition = (reducedMotion = false) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0.98 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: MOTION_DURATION.instant },
    };
  }

  return {
    initial: { opacity: 0, y: MOTION_OFFSET.pageY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -MOTION_OFFSET.pageY / 2 },
    transition: {
      duration: MOTION_DURATION.base,
      ease: MOTION_EASE.standard,
    },
  };
};

export const panelTransition = (reducedMotion = false) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: MOTION_DURATION.instant },
    };
  }

  return {
    initial: { opacity: 0, y: MOTION_OFFSET.panelY, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: MOTION_OFFSET.panelY, scale: 0.99 },
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASE.smooth,
    },
  };
};

export const sectionTransition = (reducedMotion = false) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0.98 },
      animate: { opacity: 1 },
      transition: { duration: MOTION_DURATION.instant },
    };
  }

  return {
    initial: { opacity: 0, y: MOTION_OFFSET.sectionY },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: MOTION_DURATION.base,
      ease: MOTION_EASE.standard,
    },
  };
};
