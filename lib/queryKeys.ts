export const queryKeys = {
  profile: (id?: number) =>
    id ? (["profile", id] as const) : (["profile"] as const),
  wagers: () => ["wagers"] as const,
  transactions: () => ["transactions"] as const,
};
