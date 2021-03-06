import getGroupMatrix from 'server/graphql/mutations/helpers/autoGroup/getGroupMatrix';

describe('groupReflections', () => {
  test('handles an empty matrix', async () => {
    const matrix = [];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group).toEqual([]);
  });
  test('handles a single value in the binary tree', async () => {
    const matrix = [
      [0, 1, 0]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group).toEqual([matrix]);
  });
  test('handles 2 similar values in a binary tree', async () => {
    const matrix = [
      [0.4, 0.6, 0],
      [0.6, 0.4, 0]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group.length).toBe(1);
  });
  test('separates 2 pretty different values in a binary tree', async () => {
    const matrix = [
      [0.4, 0.6, 0],
      [0, 0, 1]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group.length).toBe(2);
  });
  test('separates 3 very different values in a binary tree', async () => {
    const matrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group.length).toBe(3);
  });
  test('groups 2 similar, separates the rest', async () => {
    const matrix = [
      [1, 0, 0],
      [0.90, 0.1, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group.length).toBe(3);
  });
  test('creates 2 groups of 2', async () => {
    const matrix = [
      [1, 0, 0],
      [0.70, 0.3, 0],
      [0.2, 0.2, 0.6],
      [0.25, 0.25, 0.5]
    ];
    const {group} = getGroupMatrix(matrix, 0.5);
    expect(group.length).toBe(2);
  });
});
