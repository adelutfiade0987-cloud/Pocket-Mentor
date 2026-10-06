import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  const brandColors = ['#6C5CE7', '#FA5A50', '#FFB020', '#3FB876'];

  // Two quick bursts from center left & right
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6, x: 0.4 },
    colors: brandColors,
    ticks: 120,
    gravity: 1.2,
    scalar: 1,
  });

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6, x: 0.6 },
    colors: brandColors,
    ticks: 120,
    gravity: 1.2,
    scalar: 1,
  });
}
