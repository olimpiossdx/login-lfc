// src/core/auth/auth-access.ts

let canAccessProtectedRoutes = false;
let isAccessEvaluated = false; // já rodou boot + primeira decisão?

export const setCanAccessProtectedRoutes = (value: boolean) => {
  canAccessProtectedRoutes = value;
  isAccessEvaluated = true;
};

export const getCanAccessProtectedRoutes = () => canAccessProtectedRoutes;
export const getIsAccessEvaluated = () => isAccessEvaluated;
