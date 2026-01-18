import { NowBundle, ScheduleItem, LiveBlock } from '@/types/scheduler';

/**
 * Get the current schedule item based on now.current_schedule_item_id
 */
export const getCurrentItem = (bundle: NowBundle | null): ScheduleItem | null => {
  if (!bundle?.now?.current_schedule_item_id || !bundle.items) {
    return null;
  }
  return bundle.items.find(
    (item) => item.schedule_item_id === bundle.now.current_schedule_item_id
  ) || null;
};

/**
 * Get the next schedule item based on now.next_schedule_item_id
 */
export const getNextItem = (bundle: NowBundle | null): ScheduleItem | null => {
  if (!bundle?.now?.next_schedule_item_id || !bundle.items) {
    return null;
  }
  return bundle.items.find(
    (item) => item.schedule_item_id === bundle.now.next_schedule_item_id
  ) || null;
};

/**
 * Get the active live block for LIVE mode.
 * Prefers now.current_block_id if present, otherwise finds the LIVE schedule item
 * and matches to blocks by schedule_item_id.
 */
export const getActiveLiveBlock = (bundle: NowBundle | null): LiveBlock | null => {
  if (!bundle) return null;

  // Prefer current_block_id if present
  if (bundle.now?.current_block_id && bundle.blocks) {
    const block = bundle.blocks.find(
      (b) => b.block_id === bundle.now.current_block_id || 
             b.schedule_item_id === bundle.now.current_block_id
    );
    if (block) return block;
  }

  // Fallback: find current LIVE schedule item and match to blocks
  const currentItem = getCurrentItem(bundle);
  if (currentItem?.schedule_item_type === 'LIVE' && bundle.blocks) {
    return bundle.blocks.find(
      (b) => b.schedule_item_id === currentItem.schedule_item_id
    ) || null;
  }

  return null;
};

/**
 * Get fixture IDs for the current LIVE block.
 * Prefers active block's children.fixture_ids, falls back to current LIVE item's fixture_ids.
 */
export const getFixtureIdsForLive = (bundle: NowBundle | null): number[] => {
  if (!bundle) return [];

  // Try to get from active block
  const activeBlock = getActiveLiveBlock(bundle);
  if (activeBlock?.children?.fixture_ids?.length) {
    return activeBlock.children.fixture_ids;
  }

  // Fallback: get from current LIVE schedule item payload
  const currentItem = getCurrentItem(bundle);
  if (currentItem?.schedule_item_type === 'LIVE' && currentItem.payload) {
    const payload = currentItem.payload as { fixture_ids?: number[] };
    if (payload.fixture_ids?.length) {
      return payload.fixture_ids;
    }
  }

  return [];
};

/**
 * Get the news scope from the current NEWS schedule item
 */
export const getNewsScope = (bundle: NowBundle | null): string | null => {
  const currentItem = getCurrentItem(bundle);
  if (currentItem?.schedule_item_type === 'NEWS' && currentItem.payload) {
    const payload = currentItem.payload as { scope?: string };
    return payload.scope || null;
  }
  return null;
};

/**
 * Get the podcast show key from the current PODCAST schedule item
 */
export const getPodcastShowKey = (bundle: NowBundle | null): string | null => {
  const currentItem = getCurrentItem(bundle);
  if (currentItem?.schedule_item_type === 'PODCAST' && currentItem.payload) {
    const payload = currentItem.payload as { show_key?: string };
    return payload.show_key || null;
  }
  return null;
};

/**
 * Format a scope string for display (e.g., "premier_league" -> "Premier League")
 */
export const formatScopeForDisplay = (scope: string): string => {
  return scope
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
