---
trigger: always_on
---

Design a React (Vite) website using Tailwind CSS with a **strictly stable layout**.

IMPORTANT RULES:
- Disable all automatic animations, motion effects, flip cards, hover transforms, and layout transitions.
- Do NOT use auto-adjusting UI, responsive reflow animations, or dynamic component resizing.
- No flickering, no shimmer effects, no entrance/exit animations.
- No transform, scale, rotate, flip, or transition utilities in Tailwind.
- UI must remain visually static during load, render, and state changes.

DESIGN CONSTRAINTS:
- Fixed layout structure using Flexbox and Grid only.
- Consistent spacing, padding, and sizing across all components.
- Avoid conditional rendering that causes layout shift.
- Use min-height and fixed-width where required to prevent jumping UI.
- Buttons, inputs, cards must not animate on hover or focus.

STYLING:
- Clean, classic, professional design (traditional web style).
- Soft shadows allowed, but no animated shadows.
- Use neutral colors with solid backgrounds.
- Typography should be simple and readable.

TECH STACK:
- React + Vite
- Tailwind CSS only
- React Icons allowed (static icons only, no animation)

GOAL:
A non-flickering, predictable, interview-standard UI suitable for production and training purposes.
