exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns('posts', {
    image_url: { type: 'TEXT' }
  });
};

exports.down = pgm => {
  pgm.dropColumns('posts', ['image_url']);
};