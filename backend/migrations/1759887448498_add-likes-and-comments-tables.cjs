/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // 1. Membuat tabel 'likes'
  pgm.createTable('likes', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    post_id: {
      type: 'integer',
      notNull: true,
      references: '"posts"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Constraint: Satu user hanya bisa like satu post satu kali
  pgm.addConstraint('likes', 'likes_user_id_post_id_key', {
    unique: ['user_id', 'post_id']
  });

  // 2. Membuat tabel 'comments'
  pgm.createTable('comments', {
    id: 'id',
    content: { type: 'text', notNull: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    post_id: {
      type: 'integer',
      notNull: true,
      references: '"posts"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('comments');
  pgm.dropTable('likes');
};