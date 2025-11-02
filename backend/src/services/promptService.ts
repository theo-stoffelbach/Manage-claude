import { Prompt, PromptHistory, Fragment } from '../models';
import { extractVariables, fillVariables, replaceFragments, extractFragmentReferences } from '../utils/promptUtils';
import {
  CreatePromptInput,
  UpdatePromptInput,
  QueryPromptsInput,
  FillVariablesInput,
  RestoreVersionInput,
} from '../utils/validation';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * Create a new prompt
 */
export async function createPrompt(userId: string, data: CreatePromptInput) {
  const { accountId, title, content, category, tags } = data;

  // Extract variables from content
  const variables = extractVariables(content);

  // Create prompt
  const prompt = await Prompt.create({
    userId,
    accountId,
    title,
    content,
    category,
    tags,
    variables,
    version: 1,
    usageCount: 0,
  });

  // Create initial history entry
  await PromptHistory.create({
    promptId: prompt._id,
    version: 1,
    content,
  });

  return {
    id: prompt._id,
    userId: prompt.userId,
    accountId: prompt.accountId,
    title: prompt.title,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
    variables: prompt.variables,
    version: prompt.version,
    usageCount: prompt.usageCount,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  };
}

/**
 * Get prompts with filters and pagination
 */
export async function getPrompts(userId: string, query: QueryPromptsInput) {
  const { category, tags, search, page = 1, limit = 20 } = query;

  // Build filter
  const filter: any = { userId };

  if (category) {
    filter.category = category;
  }

  if (tags) {
    // Split comma-separated tags
    const tagArray = tags.split(',').map((t) => t.trim());
    filter.tags = { $in: tagArray };
  }

  if (search) {
    // Text search on title and content
    filter.$text = { $search: search };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const prompts = await Prompt.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Prompt.countDocuments(filter);

  return {
    prompts: prompts.map((prompt) => ({
      id: prompt._id,
      userId: prompt.userId,
      accountId: prompt.accountId,
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
      variables: prompt.variables,
      version: prompt.version,
      usageCount: prompt.usageCount,
      lastUsedAt: prompt.lastUsedAt,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a specific prompt by ID
 */
export async function getPromptById(promptId: string, userId: string) {
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  return {
    id: prompt._id,
    userId: prompt.userId,
    accountId: prompt.accountId,
    title: prompt.title,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
    variables: prompt.variables,
    version: prompt.version,
    usageCount: prompt.usageCount,
    lastUsedAt: prompt.lastUsedAt,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  };
}

/**
 * Update a prompt (creates new version in history)
 */
export async function updatePrompt(
  promptId: string,
  userId: string,
  data: UpdatePromptInput
) {
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  // Track if content changed for versioning
  let contentChanged = false;

  // Update fields
  if (data.title !== undefined) {
    prompt.title = data.title;
  }
  if (data.content !== undefined && data.content !== prompt.content) {
    prompt.content = data.content;
    prompt.variables = extractVariables(data.content);
    contentChanged = true;
  }
  if (data.category !== undefined) {
    prompt.category = data.category;
  }
  if (data.tags !== undefined) {
    prompt.tags = data.tags;
  }

  // If content changed, increment version and save to history
  if (contentChanged) {
    prompt.version += 1;

    await PromptHistory.create({
      promptId: prompt._id,
      version: prompt.version,
      content: prompt.content,
    });
  }

  await prompt.save();

  return {
    id: prompt._id,
    userId: prompt.userId,
    accountId: prompt.accountId,
    title: prompt.title,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
    variables: prompt.variables,
    version: prompt.version,
    usageCount: prompt.usageCount,
    lastUsedAt: prompt.lastUsedAt,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  };
}

/**
 * Delete a prompt and its history
 */
export async function deletePrompt(promptId: string, userId: string) {
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  // Delete all history entries
  await PromptHistory.deleteMany({ promptId });

  // Delete prompt
  await Prompt.deleteOne({ _id: promptId });

  return {
    message: 'Prompt deleted successfully',
    id: promptId,
  };
}

/**
 * Get prompt version history
 */
export async function getPromptHistory(promptId: string, userId: string) {
  // Verify prompt exists and belongs to user
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  // Get all history entries
  const history = await PromptHistory.find({ promptId }).sort({ version: -1 });

  return {
    promptId,
    currentVersion: prompt.version,
    history: history.map((entry) => ({
      id: entry._id,
      version: entry.version,
      content: entry.content,
      createdAt: entry.createdAt,
    })),
  };
}

/**
 * Restore a specific version of a prompt
 */
export async function restorePromptVersion(
  promptId: string,
  userId: string,
  data: RestoreVersionInput
) {
  const { version } = data;

  // Verify prompt exists and belongs to user
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  // Get the history entry
  const historyEntry = await PromptHistory.findOne({ promptId, version });

  if (!historyEntry) {
    throw new NotFoundError('Version not found');
  }

  // Restore content
  prompt.content = historyEntry.content;
  prompt.variables = extractVariables(historyEntry.content);
  prompt.version += 1;

  // Save new version to history
  await PromptHistory.create({
    promptId: prompt._id,
    version: prompt.version,
    content: prompt.content,
  });

  await prompt.save();

  return {
    id: prompt._id,
    userId: prompt.userId,
    accountId: prompt.accountId,
    title: prompt.title,
    content: prompt.content,
    category: prompt.category,
    tags: prompt.tags,
    variables: prompt.variables,
    version: prompt.version,
    usageCount: prompt.usageCount,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
  };
}

/**
 * Fill variables in a prompt
 */
export async function fillPromptVariables(
  promptId: string,
  userId: string,
  data: FillVariablesInput
) {
  const prompt = await Prompt.findOne({ _id: promptId, userId });

  if (!prompt) {
    throw new NotFoundError('Prompt not found');
  }

  let content = prompt.content;

  // First, replace fragments if any
  const fragmentRefs = extractFragmentReferences(content);
  if (fragmentRefs.length > 0) {
    const fragments = await Fragment.find({
      userId,
      name: { $in: fragmentRefs },
    });

    const fragmentMap: Record<string, string> = {};
    fragments.forEach((fragment) => {
      fragmentMap[fragment.name] = fragment.content;
    });

    content = replaceFragments(content, fragmentMap);
  }

  // Then, fill variables
  const filledContent = fillVariables(content, data.values);

  // Update usage count and last used
  prompt.usageCount += 1;
  prompt.lastUsedAt = new Date();
  await prompt.save();

  return {
    originalContent: prompt.content,
    filledContent,
    variables: prompt.variables,
    usedFragments: fragmentRefs,
  };
}
