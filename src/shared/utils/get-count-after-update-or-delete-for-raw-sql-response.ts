export const getCountAfterUpdateOrDeleteForRawSqlResponse = (
  raw: any,
): number => {
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _,
    updatedCount,
  ] = raw;
  return updatedCount;
};
