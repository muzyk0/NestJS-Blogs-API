import { validateOrReject } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/ban-interfaces
export const validateOrRejectModel = async <M extends Object, C>(
  model: M,
  ctor: { new (): C },
) => {
  if (!(model instanceof ctor)) {
    throw new Error('Incorrect input data');
  }

  try {
    await validateOrReject(model);
  } catch (error) {
    throw new Error(error);
  }
};
