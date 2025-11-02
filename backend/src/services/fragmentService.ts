import { Fragment } from '../models';
import { CreateFragmentInput, UpdateFragmentInput } from '../utils/validation';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * Create a new fragment
 */
export async function createFragment(userId: string, data: CreateFragmentInput) {
  const { name, content } = data;

  // Check if fragment with this name already exists for this user
  const existingFragment = await Fragment.findOne({ userId, name });
  if (existingFragment) {
    throw new ValidationError(`Fragment with name "${name}" already exists`);
  }

  const fragment = await Fragment.create({
    userId,
    name,
    content,
  });

  return {
    id: fragment._id,
    userId: fragment.userId,
    name: fragment.name,
    content: fragment.content,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

/**
 * Get all fragments for a user
 */
export async function getFragmentsByUserId(userId: string) {
  const fragments = await Fragment.find({ userId }).sort({ name: 1 });

  return fragments.map((fragment) => ({
    id: fragment._id,
    userId: fragment.userId,
    name: fragment.name,
    content: fragment.content,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  }));
}

/**
 * Get a specific fragment by ID
 */
export async function getFragmentById(fragmentId: string, userId: string) {
  const fragment = await Fragment.findOne({ _id: fragmentId, userId });

  if (!fragment) {
    throw new NotFoundError('Fragment not found');
  }

  return {
    id: fragment._id,
    userId: fragment.userId,
    name: fragment.name,
    content: fragment.content,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

/**
 * Get a fragment by name (for internal use)
 */
export async function getFragmentByName(name: string, userId: string) {
  const fragment = await Fragment.findOne({ userId, name });

  if (!fragment) {
    return null;
  }

  return {
    id: fragment._id,
    userId: fragment.userId,
    name: fragment.name,
    content: fragment.content,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

/**
 * Update a fragment
 */
export async function updateFragment(
  fragmentId: string,
  userId: string,
  data: UpdateFragmentInput
) {
  const fragment = await Fragment.findOne({ _id: fragmentId, userId });

  if (!fragment) {
    throw new NotFoundError('Fragment not found');
  }

  // If name is being changed, check for conflicts
  if (data.name !== undefined && data.name !== fragment.name) {
    const existingFragment = await Fragment.findOne({
      userId,
      name: data.name,
      _id: { $ne: fragmentId },
    });

    if (existingFragment) {
      throw new ValidationError(`Fragment with name "${data.name}" already exists`);
    }

    fragment.name = data.name;
  }

  if (data.content !== undefined) {
    fragment.content = data.content;
  }

  await fragment.save();

  return {
    id: fragment._id,
    userId: fragment.userId,
    name: fragment.name,
    content: fragment.content,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

/**
 * Delete a fragment
 */
export async function deleteFragment(fragmentId: string, userId: string) {
  const fragment = await Fragment.findOne({ _id: fragmentId, userId });

  if (!fragment) {
    throw new NotFoundError('Fragment not found');
  }

  await Fragment.deleteOne({ _id: fragmentId });

  return {
    message: 'Fragment deleted successfully',
    id: fragmentId,
  };
}

/**
 * Get multiple fragments by names (for prompt filling)
 */
export async function getFragmentsByNames(names: string[], userId: string) {
  const fragments = await Fragment.find({
    userId,
    name: { $in: names },
  });

  return fragments.reduce((acc, fragment) => {
    acc[fragment.name] = fragment.content;
    return acc;
  }, {} as Record<string, string>);
}
