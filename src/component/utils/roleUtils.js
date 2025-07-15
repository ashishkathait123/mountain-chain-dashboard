export const checkRole = (user, allowedRoles) => {
  return allowedRoles.includes(user?.role);
};