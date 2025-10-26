import { useState } from "react";

export const useAnimateValue = (_target: number) => {
  const target = Math.round(_target);
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    let timer: string | number | NodeJS.Timer | undefined;
    if (timer) {
      clearInterval(timer);
    }
    let current = value;
    const goingUp = target > current;
    const goingDown = target < current;

    if (!goingUp && !goingDown) {
      return;
    }

    timer = setInterval(() => {
      if ((goingUp && current >= target) || (goingDown && current <= target)) {
        clearInterval(timer);
        setRunning(false);
        // setValue(target);
        return;
      }

      if (goingUp) {
        current = current + 1;
      } else {
        current = current - 1;
      }

      setValue(current);
    }, 20);
  };

  if (target !== value && !running) {
    setRunning(true);
    run();
  }

  return value;
};
