ASTRON art for version 1 (static SVG, ready to animate with CSS)

Put these files in public/art. Load them as inline SVG (for example with Vite's ?raw import) so CSS can reach the parts by class.

Sun (stages 0 to 3 for today): sun-stage-0.svg ... sun-stage-3.svg
  .rays    the rays  (turn slowly, about 48 s per turn)
  .halo    the soft glow (pulse, 2 to 3 s)
  .twinkle small sparkles (fade in and out, 2 to 3 s)
Glaux the owl (six moods): glaux-happy, glaux-cheering, glaux-thinking, glaux-proud, glaux-gentle, glaux-sleepy
  .head    the head (tilt a few degrees, about 6 s)
  .eye     the eyes (blink: squash vertically for a moment, about every 4 s)
  .wing-l and .wing-r  the wings (cheering: lift and drop, about 0.7 s)
Star (for My sky): star.svg

Every animation must stop when Reduce motion is on, or when the device asks for reduced motion.
Gold (#C9A44A, #E8C46A) is decorative only and is never used for text.
