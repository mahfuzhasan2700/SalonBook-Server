import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'salonbook_jwt_super_secret_key_2026',
    { expiresIn: '7d' }
  );
};
