import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
export { gsap, ScrollTrigger, SplitText };

// Frame-rate independent smoothing keeps the same feel on 60 Hz and 120 Hz screens.
export function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}
export function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}
