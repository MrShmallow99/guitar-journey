// Camera presets aim at named model anchors, never at raw coordinates,
// so a future detailed model only needs to provide the same anchor names.
// `offset` is the camera position relative to the anchor, expressed in the
// guitar's local frame (x toward the nut, y toward the bass side, z out of
// the top face), in inches.

export const PRESETS = {
  hero:      { anchor: 'center',    offset: [-6, -12, 68], fov: 32 },
  full:      { anchor: 'center',    offset: [-2, -6, 66], fov: 32 },
  neck:      { anchor: 'fret1',     offset: [2, -9, 22], fov: 32 },
  fret12:    { anchor: 'fret12',    offset: [-4, -10, 27], fov: 32 },
  pickups:   { anchor: 'pickups',   offset: [-1, -9, 19], fov: 32 },
  neckView:  { anchor: 'neck',      offset: [0, -7, 30], fov: 32 },
  headstock: { anchor: 'headstock', offset: [-4, -6, 14], fov: 32 },
  closing:   { anchor: 'center',    offset: [10, 16, 64], fov: 32 },
};
