// matching.js — Vovu compatibility algorithm

function calculateCompatibility(userA, userB) {
  let score = 0;
  let maxScore = 0;

  // GROUP A: Activities (weight 40)
  const actA = userA.activities || [];
  const actB = userB.activities || [];
  const sharedActivities = actA.filter(a => actB.includes(a)).length;
  const totalActivities = new Set([...actA, ...actB]).size;
  score += totalActivities > 0 ? (sharedActivities / totalActivities) * 40 : 0;
  maxScore += 40;

  // GROUP B: Social energy (weight 25)
  const socialFields = [
    { a: 'group_size', b: 'group_size', w: 8 },
    { a: 'place_vibe', b: 'place_vibe', w: 6 },
    { a: 'plan_style', b: 'plan_style', w: 6 },
    { a: 'duration',   b: 'duration',   w: 5 },
  ];
  socialFields.forEach(({ a, b, w }) => {
    if (userA[a] === userB[b]) score += w;
    else if (isAdjacent(userA[a], userB[b])) score += Math.floor(w * 0.6);
    maxScore += w;
  });

  // GROUP C: Timing (weight 20)
  const timA = userA.timing || [];
  const timB = userB.timing || [];
  const sharedTiming = timA.filter(t => timB.includes(t)).length;
  score += (sharedTiming / 6) * 20;
  maxScore += 20;

  score += scoreAdjacentSingle(userA.time_of_day, userB.time_of_day, 10);
  maxScore += 10;

  // GROUP D: Personality (weight 15)
  const opennessDiff = Math.abs((userA.openness || 3) - (userB.openness || 3));
  score += Math.max(0, 8 - opennessDiff * 2);
  maxScore += 8;

  const minFT = Math.min(userA.follow_through || 3, userB.follow_through || 3);
  score += (minFT / 5) * 7;
  maxScore += 7;

  if (userA.intent === userB.intent) score += 15;
  else if (areIntentsCompatible(userA.intent, userB.intent)) score += 8;
  maxScore += 15;

  if (userA.talk_listen !== userB.talk_listen || userA.talk_listen === 'balanced') {
    score += 5;
  }
  maxScore += 5;

  return Math.round((score / maxScore) * 100);
}

function isAdjacent(a, b) {
  const orders = {
    group_size: ['1on1', 'small', 'either', 'large'],
    place_vibe: ['quiet', 'chill', 'anywhere', 'loud'],
    plan_style: ['lastminute', 'dayof', 'ahead', 'planahead'],
    duration:   ['quick', 'medium', 'long'],
  };
  for (const order of Object.values(orders)) {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return Math.abs(ia - ib) === 1;
  }
  return false;
}

function scoreAdjacentSingle(a, b, weight) {
  if (a === b) return weight;
  if (a === 'depends' || b === 'depends') return Math.floor(weight * 0.5);
  return Math.floor(weight * 0.2);
}

function areIntentsCompatible(a, b) {
  const compatible = {
    things_together: ['new_friends', 'off_phone', 'study_partner'],
    study_partner:   ['study_partner', 'things_together'],
    off_phone:       ['things_together', 'new_friends', 'off_phone'],
    new_friends:     ['things_together', 'off_phone', 'new_friends'],
  };
  // Check both directions so score(A,B) === score(B,A)
  return (compatible[a]?.includes(b) || compatible[b]?.includes(a)) ?? false;
}
