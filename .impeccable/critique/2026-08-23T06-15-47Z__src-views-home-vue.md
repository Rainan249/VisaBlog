---
target: 首页
total_score: 24
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T06-15-47Z
slug: src-views-home-vue
---
# Home.vue 设计评审 (degraded: single-context)

## Design Health Score: 24/36
| Heuristic | Score |
|---|---|
| Visibility of System Status | 3 |
| Match System / Real World | 3 |
| User Control and Freedom | 2 |
| Consistency and Standards | 3 |
| Error Prevention | 3 |
| Recognition Rather Than Recall | 3 |
| Flexibility and Efficiency | 2 |
| Aesthetic and Minimalist Design | 3 |
| Error Recovery | 2 |
| Help and Documentation | n/a |
- Applicable max: 36 (9 scored), Help n/a.

## Design Specificity
Personal character exists (mouse-driven dark reveal circle + RAINAN text matrix + Klein Blue glows). Weakest: dual hero duplication and generic ABOUT/RECENT/EDUCATION cards.

## Priority Issues
- P1: pointer-only reveal (clip-path circle) + global cursor:none shut out keyboard/touch/Sam. reveal-layer pointer-events:none makes it unreachable by focus.
- P1: dual heroes (light .hero + .reveal-body) and mixed CN/EN copy duplicate message; Jordan confused.
- P2: third-party shields badge breaks craft/brand consistency.
- P2: blur(120px) + dual infinite patternScroll; needs reduced-motion + reduced blur.
- P3: no scroll progress/position feedback on featured section.

## Personas
- Sam: no keyboard/touch path to core interaction.
- Casey: reveal lost on coarse pointer; relies on fixed desktop nav.
- Riley: needs mouse-move simulation + zoom overflow on text matrix.

## Minor
- cursor:none should be min-width 1024px gate.
- pattern-row reversed directions conflict with scroll; unify.
