/**
 * Тип возвращаемоего результата при обновлении с использованием
 * row sql запроса через dataSource.query
 * @example For update
 * [data: [Blog], updatedCount: number]
 *
 * @example For delete
 * [data: [], updatedCount: number]
 */
export type UpdateOrDeleteEntityRawSqlResponse<D = null> = [[D], number];
