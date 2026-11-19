// Leonida Ledger — screenshot states.
//
// The maker's shots are taken from fixed URLs so each one is reproducible:
//   ?shot=list                          the checklist, first detail open
//   ?shot=detail&trophy=<id>            one trophy's guide, front and centre
//   ?shot=roadmap                       the platinum roadmap
//   ?shot=tracker                       the tracker with a demo progress set
// When a shot state has painted, window.__shotReady is set so the capture
// tooling knows the frame is final.

export function readShot() {
  const params = new URLSearchParams(location.search);
  return {
    mode: params.get('shot') || '',
    trophy: params.get('trophy') || '',
  };
}

// Ten trophies a player a few evenings in might plausibly hold: the early
// story beats plus a spread of quick open-world wins. All bronze, so the
// demo header reads 10 of 55 and 150 of 1,350 points.
export const DEMO_EARNED = [
  'just-like-paradise',
  'paradise-lost',
  't-s-ass-drug-money',
  'trust',
  'master-of-none',
  'stick-fiddler',
  'baited-my-tackle',
  'whip-it-good',
  'gunslinger',
  'one-last-thing',
];

// Flags the frame as painted: two animation frames after the call, which
// is enough for the DOM built in the same tick to reach the screen.
export function markShotReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
